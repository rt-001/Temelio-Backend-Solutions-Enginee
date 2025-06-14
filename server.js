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
