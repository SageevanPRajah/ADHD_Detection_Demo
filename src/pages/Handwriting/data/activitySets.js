export const activitySets = {
  kindergarten: [
    { content: "අ", instruction: "Write the letter: A" },
    { content: "ක", instruction: "Write the letter: Ka" },
    { content: "ග", instruction: "Write the letter: Ga" },
    { content: "ච", instruction: "Write the letter: Cha" },
    { content: "ප", instruction: "Write the letter: Pa" },
    { content: "බ", instruction: "Write the letter: Ba" },
    { content: "ම", instruction: "Write the letter: Ma" },
    { content: "ය", instruction: "Write the letter: Ya" }
  ],
  grade1: [
    { content: "අම්මා", instruction: "Write the word: Mother" },
    { content: "තාත්තා", instruction: "Write the word: Father" },
    { content: "මල", instruction: "Write the word: Flower" },
    { content: "ගස", instruction: "Write the word: Tree" },
    { content: "පොත", instruction: "Write the word: Book" },
    { content: "බල්ලා", instruction: "Write the word: Dog" }
  ],
  grade2: [
    { content: "පාසල", instruction: "Write the word: School" },
    { content: "ඉස්කෝලය", instruction: "Write the word: School" },
    { content: "ගුරුවරයා", instruction: "Write the word: Teacher" },
    { content: "මිතුරා", instruction: "Write the word: Friend" },
    { content: "කෑම", instruction: "Write the word: Food" },
    { content: "වතුර", instruction: "Write the word: Water" }
  ],
  grade3: [
    { content: "ආදරණීය", instruction: "Write the word: Lovely" },
    { content: "විශ්වාසය", instruction: "Write the word: Trust" },
    { content: "උදව්කරන", instruction: "Write the word: Helpful" },
    { content: "අධ්‍යාපනය", instruction: "Write the word: Education" },
    { content: "සතුටින්", instruction: "Write the word: Happily" }
  ],
  grade4: [
    { content: "ප්‍රජාතන්ත්‍රවාදය", instruction: "Write the word: Democracy" },
    { content: "විද්‍යාගාරය", instruction: "Write the word: Laboratory" },
    { content: "සංවර්ධනය", instruction: "Write the word: Development" },
    { content: "පරිසරය", instruction: "Write the word: Environment" }
  ],
  grade5: [
    { content: "තාක්ෂණික දියුණුව", instruction: "Write the phrase: Technological advancement" },
    { content: "විශ්ව විද්‍යාලය", instruction: "Write the phrase: University" },
    { content: "ජාත්‍යන්තර සබඳතා", instruction: "Write the phrase: International relations" },
    { content: "ප්‍රජාතන්ත්‍රවාදී රජය", instruction: "Write the phrase: Democratic government" }
  ]
};

export function clamp(n, a, b) {
  return Math.max(a, Math.min(b, n));
}
