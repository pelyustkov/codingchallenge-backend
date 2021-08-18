var words = require("../json-data/words.json");
var scores = require("../json-data/scores.json");
var axios = require("axios");

async function getWords(ctx) {
  const initialUserInput = ctx.query.word;
  const filteredWordsByLength = words.filter(
    (word) => word.length <= initialUserInput.length
  );

  const validWords = [];
  for (const word of filteredWordsByLength) {
    let userInput = initialUserInput.split("");
    for (let letterPos = 0; letterPos < word.length; letterPos++) {
      const letterIndex = userInput.indexOf(word[letterPos]);

      if (letterIndex != -1) {
        if (letterPos === word.length - 1) {
          validWords.push(word);
        }
        userInput.splice(letterIndex, 1);
        continue;
      } else {
        break;
      }
    }
  }

  const validWordsWithAdditionalData = validWords
    .filter((word) => {
      const arrayWord = word.split("");
      for (let letter of word) {
        const indices = [];
        let isPresent = arrayWord.indexOf(letter);
        while (isPresent !== -1) {
          indices.push(isPresent);
          isPresent = arrayWord.indexOf(letter, isPresent + 1);
        }

        if (
          indices.length >
          scores.find((score) => score.letter === letter.toUpperCase()).count
        ) {
          return false;
        }
      }
      return true;
    })
    .map((word) => {
      const result = { word, score: 0 };
      for (let letter of word) {
        const letterScore = scores.find(
          (char) => char.letter === letter.toUpperCase()
        );
        result.score += letterScore.value;
      }
      return result;
    })
    .sort((a, b) => {
      if (a.score > b.score) {
        return -1;
      } else if (a.score === b.score) {
        if (a.word.length > b.word.length) {
          return -1;
        } else if (a.word.length === b.word.length) {
          return 0;
        } else {
          return 1;
        }
      } else {
        return 1;
      }
    })
    .slice(0, 10);

  const wordsWithDescription = await Promise.all(
    validWordsWithAdditionalData.map(async (word, index) => {
      if (index < 5) {
        try {
          const { data } = await axios.get(
            `https://api.dictionaryapi.dev/api/v2/entries/en/${word.word}`
          );
          const entry = (data[0].meanings || [])[0];
          const meaning = entry.definitions[0].definition;
          return { ...word, meaning };
        } catch (e) {
          return { ...word, meaning: "No meaning found." };
        }
      }
      return word;
    })
  );

  return {
    wordsWithDescription,
  };
}

module.exports = { getWords };
