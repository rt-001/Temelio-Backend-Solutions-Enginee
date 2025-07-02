const fs = require("fs");
const path = require("path");
const { parse } = require("json2csv");
const jsonData = require("./submissions.json");
const outputPath = path.join(__dirname, "submission_output.csv");
try {
  const responsesArray = jsonData?.responses || [];
  if (!responsesArray || !Array.isArray(responsesArray)) {
    throw new Error(
      "Invalid format: 'responses' field is missing or not an array."
    );
  }
  const getValue = (val) => (val === null || val === undefined ? "-" : val);
  const formatDate = (rawDate) => {
    if (!rawDate) return "-";
    const date = new Date(rawDate);
    if (isNaN(date)) return "-";
    const mm = String(date.getMonth() + 1).padStart(2, "0");
    const dd = String(date.getDate()).padStart(2, "0");
    const yy = String(date.getFullYear()).slice(-2);
    return `${mm}/${dd}/${yy}`;
  };
  const finishNewDate = (startDate) => {
    let currYear = Number(startDate?.split("/")[2]);
    let finishYear = currYear + 1;
    let finishDate = `${startDate?.split("/")[0]}/${
      startDate?.split("/")[1]
    }/${finishYear}`;
    return finishDate;
  };
  const checkNumber = (currChar) => {
    if (
      currChar == "0" ||
      currChar == "1" ||
      currChar == "2" ||
      currChar == "3" ||
      currChar == "4" ||
      currChar == "5" ||
      currChar == "6" ||
      currChar == "7" ||
      currChar == "8" ||
      currChar == "9"
    ) {
      return true;
    }
    return false;
  };
  const tempYear = (submissionNameString) => {
    let currYear = "";
    for (let currIdx = 0; currIdx < submissionNameString?.length; currIdx++) {
      if (submissionNameString[currIdx] === "-") {
        if (submissionNameString.length >= currIdx + 7) {
          break;
        }
        if (
          submissionNameString[currIdx + 1] === " " &&
          submissionNameString[currIdx + 6] === " " &&
          submissionNameString[currIdx + 7] === "-"
        ) {
          let yearString = "";
          if (
            checkNumber(submissionNameString[currIdx + 2]) &&
            checkNumber(submissionNameString[currIdx + 3]) &&
            checkNumber(submissionNameString[currIdx + 3]) &&
            checkNumber(submissionNameString[currIdx + 4])
          ) {
            yearString += submissionNameString[currIdx + 2];
            yearString += submissionNameString[currIdx + 3];
            yearString += submissionNameString[currIdx + 4];
            yearString += submissionNameString[currIdx + 5];
            if (currYear === "") {
              currYear = yearString;
            }
          }
        } else {
          break;
        }
      }
    }
    return currYear;
  };
  for (let i = 0; i < responsesArray.length; i++) {
    let submissionNameString = getValue(responsesArray[i]?.name);
    let currYear = "";
    // have to find - xxxx -  pattern in submission string
    if (
      getValue(responsesArray[i]?.duration?.start) === "-" &&
      getValue(responsesArray[i]?.duration?.end) === "-"
    ) {
      currYear = tempYear(submissionNameString);
      if (currYear?.length === 4) {
        responsesArray[i].duration.end = `01/01/${currYear + 1}`;
        responsesArray[i].duration.start = `01/01/${currYear}`;
      }
    } else {
      let startDate = getValue(responsesArray[i]?.duration?.start);
      if (getValue(responsesArray[i]?.duration?.end) === "-") {
        let newFinishDate = finishNewDate(startDate);
        responsesArray[i].duration.end = newFinishDate;
      }
    }
  }
  const submissions = responsesArray.map((item) => ({
    "Organization Legal Name": getValue(item?.nonprofit?.legalName),
    "Grant Submission Name": getValue(item?.name),
    Stage: getValue(item?.stage),
    "Requested Amount": getValue(item?.grantAmount?.minAmount),
    "Awarded Amount": getValue(item?.awardedAmount),
    "Grant Type": getValue(item?.grantType),
    Tags:
      item?.tags && Array.isArray(item.tags) && item.tags.length > 0
        ? item.tags.join(", ")
        : "-",
    "Pipeline/Workflow Associated": getValue(item?.pipelineInfo?.name),
    "Duration Start": formatDate(item?.duration?.start),
    "Duration End": formatDate(item?.duration?.end),
    "Grant Submission Id": getValue(item?.id),
  }));
  const csv = parse(submissions, {
    fields: [
      "Organization Legal Name",
      "Grant Submission Name",
      "Stage",
      "Requested Amount",
      "Awarded Amount",
      "Grant Type",
      "Tags",
      "Pipeline/Workflow Associated",
      "Duration Start",
      "Duration End",
      "Grant Submission Id",
    ],
  });
  fs.writeFileSync(outputPath, csv);
  console.log("CSV file successfully generated!");
} catch (err) {
  console.error("Error parsing or writing data:", err.message);
}
