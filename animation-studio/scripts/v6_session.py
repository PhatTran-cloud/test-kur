"""Session-specific repo reading receipts. This is not creative/render approval."""
import argparse
from datetime import datetime, timezone
import hashlib
import json
import os
from pathlib import Path
import re
import sys

ROOT = Path(__file__).resolve().parents[2]
CORE = ('AGENTS.md', 'CLAUDE.md', 'CONTEXT.md', 'v6/CONTRACT.md',
        'v6/execution-protocol.md', 'v6/skill-routing.md',
        'animation-studio/workflows/BUILDER_MASTER_GUIDE.md')
STAGES = {
    'init': 'plan', 'spec': 'plan', 'preview': 'build', 'render': 'render',
    'legacy-tag': 'plan', 'legacy-spec': 'plan', 'legacy-pipeline': 'plan',
    'legacy-tts': 'plan', 'legacy-asr': 'plan', 'legacy-align': 'plan',
    'asset-intake': 'build', 'media-download': 'build', 'legacy-render': 'render',
}
SOURCES = {
    'init': ('v6_packet.py',), 'spec': ('05_spec_generator.py', 'validate_v6.py'),
    'render': ('render_v6.py', 'validate_v6.py'),
    'preview': ('preview_v6.py', 'validate_v6.py'),
    'legacy-tag': ('04_tag_parser.py', '_legacy_04_tag_parser.py'),
    'legacy-spec': ('05_spec_generator.py', '_legacy_05_spec_generator.py'),
    'legacy-pipeline': ('pipeline.py',), 'legacy-tts': ('01_tts_kokoro.py',),
    'legacy-asr': ('02_asr_whisper.py',), 'legacy-align': ('03_aligner.py',),
    'asset-intake': ('intake-human.py', 'intake-modern-human.py'),
    'media-download': ('sfx_downloader.py',), 'legacy-render': ('stardust-render.cjs',),
}

class ProtocolError(ValueError):
    pass

def file_hash(path):
    return hashlib.sha256(path.read_bytes()).hexdigest()

def checked_id(value, label):
    if not isinstance(value, str) or not re.fullmatch(r'[A-Za-z0-9][A-Za-z0-9_-]{0,119}', value):
        raise ProtocolError('Invalid '+label)
    return value

def checked_scope(value):
    if not isinstance(value, str) or not re.fullmatch(r'[a-z][a-z0-9-]{0,79}', value):
        raise ProtocolError('Scope must be the exact lowercase film slug')
    return value

def active_session():
    # A running Codex chat cannot substitute another chat's identity with an override.
    return checked_id(os.environ.get('CODEX_THREAD_ID') or os.environ.get('V6_SESSION_ID'), 'active session; set V6_SESSION_ID for a non-Codex session')

def receipt_path(scope, session):
    return ROOT/'output'/checked_scope(scope)/'v6'/'sessions'/(checked_id(session, 'session')+'.json')

def required_reads(operation):
    if operation not in STAGES:
        raise ProtocolError('Unknown operation: '+operation)
    context = '02-specs'
    if operation == 'init' or operation == 'legacy-pipeline':
        context = None
    elif operation == 'legacy-tag':
        context = '01-scripts'
    elif operation in ('legacy-tts', 'legacy-asr', 'legacy-align', 'media-download'):
        context = '00-audio'
    elif operation == 'asset-intake':
        context = '03-builds'
    elif operation in ('render', 'legacy-render', 'preview'):
        context = '04-renders'
    paths = set(CORE) | {'animation-studio/workflows/CONTEXT.md',
                         'animation-studio/scripts/v6_session.py'}
    if context:
        paths.add('animation-studio/workflows/'+context+'/CONTEXT.md')
    paths.update('animation-studio/scripts/'+p for p in SOURCES[operation])
    if operation in ('spec', 'render', 'preview'):
        paths.update(('v6/manifest-guide.md', 'v6/quality-gates.md',
                      'v6/schemas/production.schema.json'))
    if operation == 'spec':
        paths.add('animation-studio/prompts/SPEC_GENERATOR.md')
    if operation == 'legacy-tag':
        paths.add('v6/legacy/animation-studio/prompts/TAG_PARSER.md')
    if operation == 'legacy-spec':
        paths.add('v6/legacy/animation-studio/prompts/SPEC_GENERATOR.md')
    return paths

def normalized_read(value):
    path = (ROOT/value).resolve()
    if not path.is_relative_to(ROOT) or not path.is_file():
        raise ProtocolError('Read path must be an existing repo file: '+str(value))
    rel = path.relative_to(ROOT).as_posix()
    # Never collect credential files or arbitrary data as rule reading evidence.
    if path.suffix not in ('.md', '.py', '.json', '.ts', '.tsx', '.cjs') or '.env' in path.name:
        raise ProtocolError('Unsupported rule/source read: '+rel)
    return rel

def validate_receipt(receipt, operation, scope, session):
    if not isinstance(receipt, dict) or receipt.get('version') != 1:
        raise ProtocolError('Malformed session receipt')
    if receipt.get('session_id') != session or receipt.get('scope') != scope:
        raise ProtocolError('Receipt belongs to another session/film')
    if not receipt.get('actor') or not receipt.get('intent') or not receipt.get('created_at'):
        raise ProtocolError('Receipt needs actor, user intent and timestamp')
    steps = receipt.get('steps')
    if not isinstance(steps, dict) or operation not in steps:
        raise ProtocolError('Step not declared for this session: '+operation)
    step = steps[operation]
    if not isinstance(step, dict) or not isinstance(step.get('decisions'), list) or not step['decisions'] or not all(isinstance(d, str) and d.strip() for d in step['decisions']):
        raise ProtocolError('Step decisions missing')
    reads = step.get('reads')
    if not isinstance(reads, dict) or not required_reads(operation) <= set(reads):
        raise ProtocolError('Required actual reads missing for '+operation)
    if not any(p.startswith('v6/skills/') and p.endswith('/SKILL.md') for p in reads):
        raise ProtocolError('Read the owning repo-local skill entry and relevant references')
    for value, expected in reads.items():
        rel = normalized_read(value)
        if rel != value or file_hash(ROOT/rel) != expected:
            raise ProtocolError('Stale/noncanonical reading receipt; reread: '+value)
    if operation.startswith('legacy-') and not any((ROOT/'output'/scope/p).is_file() for p in ('tagged-script.md', 'raw-script.md', 'timeline.json')):
        raise ProtocolError('Legacy is only for an existing historic film')
    return step

def acknowledge(session, actor, scope, operation, reads, decisions, intent):
    """Hash explicitly attested reads; does not assert that hashing proves understanding."""
    checked_id(session, 'session'); checked_scope(scope)
    if session != active_session():
        raise ProtocolError('Acknowledgement must belong to the active session')
    read_map = {normalized_read(p): file_hash(ROOT/normalized_read(p)) for p in reads}
    path = receipt_path(scope, session)
    if operation == 'init' and (ROOT/'output'/scope/'v6'/'production.json').exists():
        raise ProtocolError('Packet already exists; do not reset it')
    receipt = json.loads(path.read_text(encoding='utf-8')) if path.exists() else {
        'version': 1, 'session_id': session, 'scope': scope, 'actor': actor,
        'intent': intent, 'created_at': datetime.now(timezone.utc).isoformat(), 'steps': {},
    }
    if receipt.get('actor') != actor or receipt.get('intent') != intent:
        raise ProtocolError('Keep session actor/intent stable; start a new session for a different task')
    receipt['steps'][operation] = {'reads': read_map, 'decisions': decisions}
    validate_receipt(receipt, operation, scope, session)
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(receipt, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')
    return path

def require_session(operation, scope, *, record=True):
    scope = checked_scope(scope); session = active_session()
    path = receipt_path(scope, session)
    try:
        receipt = json.loads(path.read_text(encoding='utf-8'))
    except (OSError, ValueError) as error:
        raise ProtocolError('Missing/unreadable active-session receipt. Follow v6/execution-protocol.md before '+operation) from error
    step = validate_receipt(receipt, operation, scope, session)
    if record:
        production = ROOT/'output'/scope/'v6'/'production.json'
        if production.is_file():
            prod = json.loads(production.read_text(encoding='utf-8-sig'))
            entry = {'stage': STAGES[operation], 'paths': sorted(step['reads']),
                     'decisions': step['decisions'], 'session_id': session,
                     'actor': receipt['actor'], 'operation': operation,
                     'timestamp': datetime.now(timezone.utc).isoformat(), 'hashes': step['reads']}
            prod.setdefault('rule_reads', []).append(entry)
            production.write_text(json.dumps(prod, indent=2, ensure_ascii=False)+'\n', encoding='utf-8')
    return receipt

def guard(operation, scope, *, legacy=False, record=True):
    if legacy:
        if '--legacy-v5' not in sys.argv:
            raise SystemExit('V6_PROTOCOL: Historic utility requires --legacy-v5 and a current session receipt')
        sys.argv.remove('--legacy-v5')
    try:
        return require_session(operation, scope, record=record)
    except (ProtocolError, OSError, ValueError) as error:
        raise SystemExit('V6_PROTOCOL: '+str(error)) from error

def main():
    parser = argparse.ArgumentParser(description=__doc__)
    sub = parser.add_subparsers(dest='command', required=True)
    requirements = sub.add_parser('requirements', help='Read-only list; does not acknowledge reading')
    requirements.add_argument('operation', choices=STAGES)
    ack = sub.add_parser('ack', help='Record only files you actually read, with decisions')
    ack.add_argument('--session', required=True)
    ack.add_argument('--actor', required=True)
    ack.add_argument('--scope', required=True)
    ack.add_argument('--operation', required=True, choices=STAGES)
    ack.add_argument('--intent', required=True, help='Actual user-authorized task; never approval invented by the tool')
    ack.add_argument('--read', action='append', required=True)
    ack.add_argument('--decision', action='append', required=True)
    check = sub.add_parser('check', help='Read-only preflight; does not execute the step')
    check.add_argument('operation', choices=STAGES)
    check.add_argument('scope')
    args = parser.parse_args()
    try:
        if args.command == 'requirements':
            print('\n'.join(sorted(required_reads(args.operation))))
        elif args.command == 'ack':
            print(acknowledge(args.session, args.actor, args.scope, args.operation,
                              args.read, args.decision, args.intent))
        else:
            require_session(args.operation, args.scope, record=False)
            print('Session preflight passed; no production/review/render approval granted')
    except (OSError, ValueError) as error:
        parser.exit(1, 'V6_PROTOCOL: '+str(error)+'\n')

if __name__ == '__main__':
    main()
