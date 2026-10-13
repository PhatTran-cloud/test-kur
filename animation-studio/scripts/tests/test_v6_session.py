"""Synthetic session enforcement tests; never call media services or render."""
import json
import os
from pathlib import Path
import subprocess
import sys
import tempfile
import unittest
from unittest.mock import patch

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
import v6_session as protocol
from validate_v6 import ROOT

class SessionProtocol(unittest.TestCase):
    def setUp(self):
        self.temp = tempfile.TemporaryDirectory()
        self.root = Path(self.temp.name)
        self.root_patch = patch.object(protocol, 'ROOT', self.root)
        self.root_patch.start()
        self.env_patch = patch.dict(os.environ, {'CODEX_THREAD_ID': 'test-session', 'V6_SESSION_ID': 'test-session'}, clear=True)
        self.env_patch.start()
        self.reads = protocol.required_reads('spec') | {'v6/skills/remotion-best-practices/SKILL.md'}
        for name in self.reads:
            p = self.root/name
            p.parent.mkdir(parents=True, exist_ok=True)
            p.write_text('SYNTHETIC READ TEST ONLY', encoding='utf-8')
    def tearDown(self):
        self.env_patch.stop(); self.root_patch.stop(); self.temp.cleanup()
    def ack(self):
        return protocol.acknowledge('test-session', 'test harness', 'test-film', 'spec',
                                    self.reads, ['synthetic test only'], 'test only')
    def test_missing_session_fails_before_writes(self):
        with self.assertRaises(protocol.ProtocolError): protocol.require_session('spec', 'test-film')
        self.assertFalse((self.root/'output').exists())
    def test_exact_session_operation_and_scope_pass(self):
        self.ack()
        self.assertEqual(protocol.require_session('spec', 'test-film', record=False)['session_id'], 'test-session')
    def test_other_session_rejected(self):
        self.ack()
        with patch.dict(os.environ, {'CODEX_THREAD_ID': 'another-session'}):
            with self.assertRaises(protocol.ProtocolError): protocol.require_session('spec', 'test-film')
    def test_override_cannot_replace_codex_identity(self):
        with patch.dict(os.environ, {'V6_SESSION_ID': 'another-session'}):
            self.assertEqual(protocol.active_session(), 'test-session')
    def test_other_film_rejected_even_with_copied_receipt(self):
        source = self.ack()
        target = protocol.receipt_path('other-film', 'test-session')
        target.parent.mkdir(parents=True); target.write_bytes(source.read_bytes())
        with self.assertRaises(protocol.ProtocolError): protocol.require_session('spec', 'other-film')
    def test_step_not_declared_rejected(self):
        self.ack()
        with self.assertRaises(protocol.ProtocolError): protocol.require_session('render', 'test-film')
    def test_changed_source_invalidates_receipt(self):
        self.ack()
        (self.root/'animation-studio/scripts/05_spec_generator.py').write_text('changed')
        with self.assertRaises(protocol.ProtocolError): protocol.require_session('spec', 'test-film')
    def test_changed_rules_invalidate_receipt(self):
        self.ack(); (self.root/'CLAUDE.md').write_text('changed')
        with self.assertRaises(protocol.ProtocolError): protocol.require_session('spec', 'test-film')
    def test_missing_actual_read_fails(self):
        self.reads.remove('CONTEXT.md')
        with self.assertRaises(protocol.ProtocolError): self.ack()
        self.assertFalse((self.root/'output').exists())
    def test_missing_skill_fails(self):
        self.reads.remove('v6/skills/remotion-best-practices/SKILL.md')
        with self.assertRaises(protocol.ProtocolError): self.ack()
    def test_missing_decisions_fails(self):
        with self.assertRaises(protocol.ProtocolError):
            protocol.acknowledge('test-session', 'test harness', 'test-film', 'spec', self.reads, [], 'test only')
    def test_path_escape_rejected(self):
        for value in ('../escape', 'C:/outside', ''):
            with self.assertRaises(protocol.ProtocolError): protocol.receipt_path(value, 'test-session')
    def test_credentials_not_read_receipts(self):
        (self.root/'.env').write_text('SYNTHETIC ONLY')
        with self.assertRaises(protocol.ProtocolError): protocol.normalized_read('.env')
    def test_receipt_does_not_approve_or_change_core(self):
        self.ack()
        production = self.root/'output/test-film/v6/production.json'
        core = {'rule_reads': [], 'reviews': {'art_lock': {'status': 'unstarted'}},
                'render_authorization': {'authorized': False}}
        production.write_text(json.dumps(core))
        protocol.require_session('spec', 'test-film')
        data = json.loads(production.read_text())
        self.assertEqual(data['reviews'], core['reviews'])
        self.assertFalse(data['render_authorization']['authorized'])
        self.assertEqual(data['rule_reads'][0]['hashes']['CONTEXT.md'], protocol.file_hash(self.root/'CONTEXT.md'))
    def test_malformed_receipt_rejected(self):
        path = self.ack(); path.write_text('[]')
        with self.assertRaises(protocol.ProtocolError): protocol.require_session('spec', 'test-film')

class EntryPoints(unittest.TestCase):
    def test_production_clis_refuse_without_session(self):
        env = {k: v for k, v in os.environ.items() if k not in ('CODEX_THREAD_ID', 'V6_SESSION_ID', 'V6_FILM_SLUG')}
        scripts = ROOT/'animation-studio/scripts'
        commands = [
            ['v6_packet.py', 'init', 'protocol-test-unused'],
            ['05_spec_generator.py', 'protocol-test-unused'],
            ['render_v6.py', 'protocol-test-unused', '--entry', 'src/index.ts', '--composition', 'Test', '--dry-run'],
            ['preview_v6.py', 'protocol-test-unused', '--purpose', 'pilot', '--name', 'test', '--dry-run'],
            ['01_tts_kokoro.py', 'protocol-test-unused', '--legacy-v5'],
            ['02_asr_whisper.py', 'protocol-test-unused', '--legacy-v5'],
            ['03_aligner.py', 'protocol-test-unused', '--legacy-v5'],
            ['_legacy_05_spec_generator.py', 'protocol-test-unused', '--legacy-v5'],
            ['intake-human.py'], ['intake-modern-human.py'], ['sfx_downloader.py', '--query', 'test'],
            ['04_tag_parser.py', str(ROOT/'CLAUDE.md'), '--legacy-v5'],
            ['_legacy_04_tag_parser.py', str(ROOT/'CLAUDE.md'), '--legacy-v5'],
            ['pipeline.py', str(ROOT/'CLAUDE.md'), '--legacy-v5'],
        ]
        for command in commands:
            with self.subTest(command=command):
                run = subprocess.run([sys.executable, str(scripts/command[0]), *command[1:]],
                                     cwd=ROOT, env=env, capture_output=True, text=True, timeout=15)
                self.assertNotEqual(run.returncode, 0)
                self.assertIn('V6_PROTOCOL', run.stdout+run.stderr)
        self.assertFalse((ROOT/'output/protocol-test-unused').exists())
    def test_npm_build_uses_guarded_renderer(self):
        package = json.loads((ROOT/'animation-studio/package.json').read_text())
        self.assertEqual(package['scripts']['build'], 'python scripts/render_v6.py')
    def test_historic_node_renderer_refuses_before_loading_remotion(self):
        env = {k: v for k, v in os.environ.items() if k not in ('CODEX_THREAD_ID', 'V6_SESSION_ID')}
        run = subprocess.run(['node', str(ROOT/'animation-studio/scripts/stardust-render.cjs'), '--qa'],
                             cwd=ROOT, env=env, capture_output=True, text=True, timeout=15)
        self.assertNotEqual(run.returncode, 0)
        self.assertIn('V6_PROTOCOL', run.stdout+run.stderr)

if __name__ == '__main__': unittest.main()
