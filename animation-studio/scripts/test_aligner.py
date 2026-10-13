import importlib.util
import unittest
from pathlib import Path

spec = importlib.util.spec_from_file_location("aligner", Path(__file__).with_name("03_aligner.py"))
aligner = importlib.util.module_from_spec(spec)
spec.loader.exec_module(aligner)


class AlignerRegression(unittest.TestCase):
    def test_adjacent_tags_and_repeated_words_keep_their_sentence(self):
        script = "The Sun came first. [SB][META: type=timeline, subtype=era] [EM: The] Earth formed [STAT: four point five | billion years] ago. [SB] The Sun remains."
        spoken = "The Sun came first The Earth formed four point five billion years ago The Sun remains".split()
        words = [{"word": w, "start": i * 0.5, "end": i * 0.5 + 0.4} for i, w in enumerate(spoken)]
        beats = aligner.align_tags_to_frames(script, words)
        self.assertTrue(all(b["aligned"] for b in beats))
        self.assertEqual([b["frame"] for b in beats], [60, 60, 60, 105, 195])

    def test_missing_asr_word_does_not_jump_to_later_repetition(self):
        script = "A [EM: tiny] star exploded. A tiny planet cooled."
        spoken = "A star exploded A tiny planet cooled".split()
        words = [{"word": w, "start": i, "end": i + 0.5} for i, w in enumerate(spoken)]
        self.assertEqual(aligner.align_tags_to_frames(script, words)[0]["frame"], 30)

    def test_nested_visual_list_has_no_spoken_tokens(self):
        script = "A star. [SB][META: type=icon, subtype=group, symbols=[water,fire]] The [EM: ocean] formed."
        spoken = "A star The ocean formed".split()
        words = [{"word": w, "start": i, "end": i + .4} for i, w in enumerate(spoken)]
        self.assertEqual([b['frame'] for b in aligner.align_tags_to_frames(script, words)], [60,60,90])


if __name__ == "__main__":
    unittest.main()
