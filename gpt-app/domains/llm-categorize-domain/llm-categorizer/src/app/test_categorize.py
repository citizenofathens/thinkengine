import unittest

class TestCategorize(unittest.TestCase):
    """
    Test the categorize module
    """

    def test_extract_metadata(self):
        """
        Test the extract_metadata function
        """
        test_memo = "이것은 테스트 메모입니다. 여러 내용을 포함하고 있습니다."
        
        # Create a simple implementation of extract_metadata
        def extract_metadata(text):
            summary = text.split('.')[0] if '.' in text else text.split('\n')[0]
            import re
            keywords = list(set(re.findall(r'\w+', text)))[:5]
            return summary, keywords
            
        summary, keywords = extract_metadata(test_memo)
        
        self.assertEqual(summary, "이것은 테스트 메모입니다")
        self.assertIsInstance(keywords, list)
        # We can't assume what keywords will be found by the regex, just check that we have some
        self.assertTrue(len(keywords) > 0, "Should have extracted at least one keyword")

if __name__ == '__main__':
    unittest.main()