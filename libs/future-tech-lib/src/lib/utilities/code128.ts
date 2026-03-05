const code128List = [
  {
    character: "Space",
    value: 0,
    pattern: "bbsbbssbbss"
  },
  {
    character: "!",
    value: 1,
    pattern: "bbssbbsbbss"
  },
  {
    character: "“",
    value: 2,
    pattern: "bbssbbssbbs"
  },
  {
    character: "#",
    value: 3,
    pattern: "bssbssbbsss"
  },
  {
    character: "$",
    value: 4,
    pattern: "bssbsssbbss"
  },
  {
    character: "%",
    value: 5,
    pattern: "bsssbssbbss"
  },
  {
    character: "&",
    value: 6,
    pattern: "bssbbssbsss"
  },
  {
    character: "(",
    value: 7,
    pattern: "bssbbsssbss"
  },
  {
    character: ")",
    value: 8,
    pattern: "bsssbbssbss"
  },
  {
    character: "*",
    value: 9,
    pattern: "bbssbssbsss"
  },
  {
    character: "*",
    value: 10,
    pattern: "bbssbsssbss"
  },
  {
    character: "#ERROR!",
    value: 11,
    pattern: "bbsssbssbss"
  },
  {
    character: ",",
    value: 12,
    pattern: "bsbbssbbbss"
  },
  {
    character: "-",
    value: 13,
    pattern: "bssbbsbbbss"
  },
  {
    character: ".",
    value: 14,
    pattern: "bssbbssbbbs"
  },
  {
    character: "/",
    value: 15,
    pattern: "bsbbbssbbss"
  },
  {
    character: "0",
    value: 16,
    pattern: "bssbbbsbbss"
  },
  {
    character: "1",
    value: 17,
    pattern: "bssbbbssbbs"
  },
  {
    character: "2",
    value: 18,
    pattern: "bbssbbbssbs"
  },
  {
    character: "3",
    value: 19,
    pattern: "bbssbsbbbss"
  },
  {
    character: "4",
    value: 20,
    pattern: "bbssbssbbbs"
  },
  {
    character: "5",
    value: 21,
    pattern: "bbsbbbssbss"
  },
  {
    character: "6",
    value: 22,
    pattern: "bbssbbbsbss"
  },
  {
    character: "7",
    value: 23,
    pattern: "bbbsbbsbbbs"
  },
  {
    character: "8",
    value: 24,
    pattern: "bbbsbssbbss"
  },
  {
    character: "9",
    value: 25,
    pattern: "bbbssbsbbss"
  },
  {
    character: ":",
    value: 26,
    pattern: "bbbssbssbbs"
  },
  {
    character: ";",
    value: 27,
    pattern: "bbbsbbssbss"
  },
  {
    character: "<",
    value: 28,
    pattern: "bbbssbbsbss"
  },
  {
    character: "Equal",
    value: 29,
    pattern: "bbbssbbssbs"
  },
  {
    character: ">",
    value: 30,
    pattern: "bbsbbsbbsss"
  },
  {
    character: "?",
    value: 31,
    pattern: "bbsbbsssbbs"
  },
  {
    character: "@",
    value: 32,
    pattern: "bbsssbbsbbs"
  },
  {
    character: "A",
    value: 33,
    pattern: "bsbsssbbsss"
  },
  {
    character: "B",
    value: 34,
    pattern: "bsssbsbbsss"
  },
  {
    character: "C",
    value: 35,
    pattern: "bsssbsssbbs"
  },
  {
    character: "D",
    value: 36,
    pattern: "bsbbsssbsss"
  },
  {
    character: "E",
    value: 37,
    pattern: "bsssbbsbsss"
  },
  {
    character: "F",
    value: 38,
    pattern: "bsssbbsssbs"
  },
  {
    character: "G",
    value: 39,
    pattern: "bbsbsssbsss"
  },
  {
    character: "H",
    value: 40,
    pattern: "bbsssbsbsss"
  },
  {
    character: "I",
    value: 41,
    pattern: "bbsssbsssbs"
  },
  {
    character: "J",
    value: 42,
    pattern: "bsbbsbbbsss"
  },
  {
    character: "K",
    value: 43,
    pattern: "bsbbsssbbbs"
  },
  {
    character: "L",
    value: 44,
    pattern: "bsssbbsbbbs"
  },
  {
    character: "M",
    value: 45,
    pattern: "bsbbbsbbsss"
  },
  {
    character: "N",
    value: 46,
    pattern: "bsbbbsssbbs"
  },
  {
    character: "O",
    value: 47,
    pattern: "bsssbbbsbbs"
  },
  {
    character: "P",
    value: 48,
    pattern: "bbbsbbbsbbs"
  },
  {
    character: "Q",
    value: 49,
    pattern: "bbsbsssbbbs"
  },
  {
    character: "R",
    value: 50,
    pattern: "bbsssbsbbbs"
  },
  {
    character: "S",
    value: 51,
    pattern: "bbsbbbsbsss"
  },
  {
    character: "T",
    value: 52,
    pattern: "bbsbbbsssbs"
  },
  {
    character: "U",
    value: 53,
    pattern: "bbsbbbsbbbs"
  },
  {
    character: "V",
    value: 54,
    pattern: "bbbsbsbbsss"
  },
  {
    character: "W",
    value: 55,
    pattern: "bbbsbsssbbs"
  },
  {
    character: "X",
    value: 56,
    pattern: "bbbsssbsbbs"
  },
  {
    character: "Y",
    value: 57,
    pattern: "bbbsbbsbsss"
  },
  {
    character: "Z",
    value: 58,
    pattern: "bbbsbbsssbs"
  },
  {
    character: "[",
    value: 59,
    pattern: "bbbsssbbsbs"
  },
  {
    character: "\\",
    value: 60,
    pattern: "bbbsbbbbsbs"
  },
  {
    character: "]",
    value: 61,
    pattern: "bbssbssssbs"
  },
  {
    character: "^",
    value: 62,
    pattern: "bbbbsssbsbs"
  },
  {
    character: "_",
    value: 63,
    pattern: "bsbssbbssss"
  },
  {
    character: "`",
    value: 64,
    pattern: "bsbssssbbss"
  },
  {
    character: "a",
    value: 65,
    pattern: "bssbsbbssss"
  },
  {
    character: "b",
    value: 66,
    pattern: "bssbssssbbs"
  },
  {
    character: "c",
    value: 67,
    pattern: "bssssbsbbss"
  },
  {
    character: "d",
    value: 68,
    pattern: "bssssbssbbs"
  },
  {
    character: "e",
    value: 69,
    pattern: "bsbbssbssss"
  },
  {
    character: "f",
    value: 70,
    pattern: "bsbbssssbss"
  },
  {
    character: "g",
    value: 71,
    pattern: "bssbbsbssss"
  },
  {
    character: "h",
    value: 72,
    pattern: "bssbbssssbs"
  },
  {
    character: "i",
    value: 73,
    pattern: "bssssbbsbss"
  },
  {
    character: "j",
    value: 74,
    pattern: "bssssbbssbs"
  },
  {
    character: "k",
    value: 75,
    pattern: "bbssssbssbs"
  },
  {
    character: "l",
    value: 76,
    pattern: "bbssbsbssss"
  },
  {
    character: "m",
    value: 77,
    pattern: "bbbbsbbbsbs"
  },
  {
    character: "n",
    value: 78,
    pattern: "bbssssbsbss"
  },
  {
    character: "o",
    value: 79,
    pattern: "bsssbbbbsbs"
  },
  {
    character: "p",
    value: 80,
    pattern: "bsbssbbbbss"
  },
  {
    character: "q",
    value: 81,
    pattern: "bssbsbbbbss"
  },
  {
    character: "r",
    value: 82,
    pattern: "bssbssbbbbs"
  },
  {
    character: "s",
    value: 83,
    pattern: "bsbbbbssbss"
  },
  {
    character: "t",
    value: 84,
    pattern: "bssbbbbsbss"
  },
  {
    character: "u",
    value: 85,
    pattern: "bssbbbbssbs"
  },
  {
    character: "v",
    value: 86,
    pattern: "bbbbsbssbss"
  },
  {
    character: "w",
    value: 87,
    pattern: "bbbbssbsbss"
  },
  {
    character: "x",
    value: 88,
    pattern: "bbbbssbssbs"
  },
  {
    character: "y",
    value: 89,
    pattern: "bbsbbsbbbbs"
  },
  {
    character: "z",
    value: 90,
    pattern: "bbsbbbbsbbs"
  },
  {
    character: "{",
    value: 91,
    pattern: "bbbbsbbsbbs"
  },
  {
    character: "|",
    value: 92,
    pattern: "bsbsbbbbsss"
  },
  {
    character: "}",
    value: 93,
    pattern: "bsbsssbbbbs"
  },
  {
    character: "~",
    value: 94,
    pattern: "bsssbsbbbbs"
  },
  {
    character: "DEL",
    value: 95,
    pattern: "bsbbbbsbsss"
  },
  {
    character: "FNC3",
    value: 96,
    pattern: "bsbbbbsssbs"
  },
  {
    character: "FNC2",
    value: 97,
    pattern: "bbbbsbsbsss"
  },
  {
    character: "Shift",
    value: 98,
    pattern: "bbbbsbsssbs"
  },
  {
    character: "Switch Code C",
    value: 99,
    pattern: "bsbbbsbbbbs"
  },
  {
    character: "FNC4",
    value: 100,
    pattern: "bsbbbbsbbbs"
  },
  {
    character: "Switch Code A",
    value: 101,
    pattern: "bbbsbsbbbbs"
  },
  {
    character: "FNC1",
    value: 102,
    pattern: "bbbbsbsbbbs"
  }
];

function checkDigit(arr) {
  var result = 0;

  arr.map((element, index) => {
    var newIndex = index + 1;
    return (result = result + element * newIndex);
  });

  // Add Start code to calculation - start code value = 104
  var resultWithStartCode = result + 104;

  // Calculating to find Check Digit value
  var checkDigitCalculation = resultWithStartCode % 103;

  // Find corresponding value to add to final pattern
  var checkDigitPattern = code128List.filter(
    (data) => data.value === checkDigitCalculation
  );
  return checkDigitPattern[0].pattern;
}

function encodeBarsAndSpaces(data) {
  var output = "";
  var pattern = "";

  // Code 128B start
  var start = "bbsbssbssss";

  // Code 128B Stop
  var stop = "bbsssbbbsbsbb";

  // Array for code value - using later for Check Digit Calculation
  var charValue:any = [];

  // Loop over every character & find corresponding value and pattern
  for (const character of data.split("")) {
    var code = code128List.filter((code) => code.character === character);
    pattern = code[0].pattern;
    charValue.push(code[0].value);
    output += pattern;
  }

  // Creating final drawing pattern
  var drawingPattern = start + output + checkDigit(charValue) + stop;

  return drawingPattern;
}

export function drawBarcode(string, options, jsPDF) {
  // Default options
  var yAxis = options.yAxis || 2;
  var xAxis = options.xAxis || 10;
  var width = options.width || 0.5;
  var height = options.height || 6;

  // Default colors
  var color = options.color || "#000";
  var background = options.background || "#FFF";

  // Encoding data to barcode pattern
  var data = encodeBarsAndSpaces(string);

  var finalData:any = [];

  // Drawing barcode based on encoded pattern
  for (const pattern of data.split("")) {
    if (pattern === "b") {
      jsPDF.setFillColor(color);
      jsPDF.rect(yAxis, xAxis, width, height, "F");
      yAxis = yAxis + width;
      var exp = {
        yAxis: yAxis,
        xAxis: xAxis,
        width: width,
        height: height,
        color: "black"
      };
      finalData.push(exp);
    } else {
      jsPDF.setFillColor(background);
      jsPDF.rect(yAxis, xAxis, width, height, "F");
      yAxis = yAxis + width;
      var exp = {
        yAxis: yAxis,
        xAxis: xAxis,
        width: width,
        height: height,
        color: "white"
      };
      finalData.push(exp);
    }
  }
}
