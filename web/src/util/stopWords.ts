export const STOP_WORDS = new Set<string>([

    // "Untitled Deck"
    "untitled",
    "deck",

    // Subjective Pronouns
    "i",
    "you",
    "he",
    "she",
    "it",
    "we",
    "they",
    "what",
    "who",

    // Objective Pronouns
    // IT: "it", See Subjective Pronoun
    "me",
    "him",
    "her",
    "us",
    "them",

    // Possessive Pronouns
    // MINE: "mine", Exclude from stop words because we want to capture words like "gold mine"
    "yours",
    "his",
    "hers",
    "ours",
    "theirs",

    // Demonstrative Pronouns
    "this",
    "that",
    "these",
    "those",

    // Relative Pronouns
    // "who", See Subjective Pronoun
    // "that", See Demonstrative Pronoun
    // "what", See Subjective Pronoun 
    "whom",
    "which",
    "whose",
    "whatever",
    "whoever",
    "whomever",
    "whichever",

    // Reflexive Pronouns
    "myself",
    "yourself",
    "himself",
    "herself",
    "itself",
    "ourselves",
    "themselves",

    // Reciprocal Pronouns
    "other", // "each other"
    "another", // "one another"

    // Indefinite pronouns
    // "another", Duplicate from Reciprocal Pronouns
    "anything",
    "everybody",
    "each",
    "few",
    "many",
    "none",
    "some",
    "all",
    "any",
    "anybody",
    "anyone",
    "everyone",
    "everything",
    "no", // Part of "no one"
    "nobody",
    "nothing",
    "none",
    "other",
    "others",
    "several",
    "somebody",
    "something",
    "most",
    "enough",
    "more", // Part of "little more"
    "both",
    "either",
    "neither",
    // "one", See Numbers
    "much",
    "such",

    // Determiners
    // Articles
    "a",
    "an",
    "the",
    // Quantifiers
    "few",
    "little",
    "much",
    "many",
    "lot", // Part of "a lot"
    // Numbers
    "one",
    "two",
    "three",
    "four",
    "five",
    "six",
    "seven",
    "eight",
    "nine",
    "ten",
    "eleven",
    "twelve",
    "thirteen",
    "fourteen",
    "fifteen",
    "sixteen",
    "seventeen",
    "eighteen",
    "ninetine",
    "twenty",
    "thirty",
    "forty",
    "fifty",
    "sixty",
    "seventy",
    "eighty",
    "ninety",
    "hundred",
    "thousand",
    "million",
    "billion",
    "trillion",

    // Prepositions
    
    "aboard",
    "about",
    "above",
    "across",
    "after",
    "against",
    "along",
    "alongside",
    "amid",
    "amidst",
    "among",
    "amongst",
    "around",
    "as",
    "astride",
    "at",
    "atop",
    "before",
    "behind",
    "below",
    "beneath",
    "beside",
    "between",
    "beyond",
    "but",
    "by",
    "circa",
    "concerning",
    "considering",
    "counting",
    "cum",
    "de", // Spanish
    "del", // Spanish
    "despite",
    "down",
    "during",
    "except",
    "excepting",
    "excluding",
    "following",
    "for",
    "from",
    "given",
    "gone",
    "in",
    "including",
    "inside",
    "into",
    "less",
    "like",
    "minus",
    "near",
    "notwithstanding",
    "of",
    "off",
    "on",
    "onto",
    "opposite",
    "outside",
    "over",
    "past",
    // PENDING : "pending",
    "per",
    "plus",
    "pro",
    "re",
    // REGARDING : "regarding",
    // RESPECTING : "respecting",
    "round",
    "save",
    "saving",
    "since",
    "than",
    "through",
    "throughout",
    "till",
    "to",
    "touching",
    "toward",
    "towards",
    "under",
    "underneath",
    "unlike",
    "until",
    "up",
    "upon",
    "versus",
    "vs",
    "via",
    "with",
    "within",
    "without",
    "worth",

    // Conjunctions
    // "that", See Demonstrative Pronouns
    // "since", See Prepositions
    // "until", See Prepositions
    // "which", See Relative Pronouns
    // "who", See Subjective Pronouns
    // "much", See Indefinite pronouns
    // "than", See Prepositions
    // "since", See Prepositions
    "for",
    "and",
    "nor",
    "but",
    "or",
    "yet",
    "so",
    "long", // Part of "as long as"
    "soon", // Part of "as soon as"
    "though", // Part of "as though"
    "even", // Part of "even if", "even though"
    "if",
    "when",
    "provided", // Part of "provided that"
    "supposing",
    "whenever",
    "wherever",
    "although",
    "because",
    "only",  // Part of "if only", "only if"
    "then", // Part of of "if then"
    "order", // Part of "in order that"
    "lest",
    "now", // Part of "now since"
    "rather", // Part of "rather than"
    "whereas",
    "once",
    "while",
    "where",
    "unless",
    "assuming", // Part of "assuming that",
    "case", // Part of "in case (that)"
    "how",
]);  