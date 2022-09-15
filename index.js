const axios = require("axios");
const express = require("express");
const app = express();
const cors = require("cors");
app.use(cors());

// function that fetches all CS4k Semester 2 modules in NUSMODs and their corresponding prerequisites.
app.get("/", async (req, res) => {
  // get data
  const url = "https://api.nusmods.com/v2/2022-2023/moduleList.json";
  const resp = await axios({
    method: "GET",
    url: url,
  });
  const modules = resp.data;
  const CS4KAY2022 = modules.filter((module) =>
    module.moduleCode.includes("CS4")
  );
  const S2 = CS4KAY2022.filter((module) => module.semesters.includes(2));

  // fetch prerequisites for each module
  const result = S2.map((x) => x);

  // sequential method. slow response time
  // for (let i = 0; i < result.length; i++) {
  //   let module = await axios({
  //       method: "GET",
  //       url: `https://api.nusmods.com/v2/2022-2023/modules/${result[i].moduleCode}.json`
  //   });
  //   const moduleObj = result[i];
  //   moduleObj["prereqs"] = module.data.prerequisite;
  // }

  // parallel method. slightly faster?
  await Promise.all(
    result.map(async (i) => {
      let module = await axios({
        method: "GET",
        url: `https://api.nusmods.com/v2/2022-2023/modules/${i.moduleCode}.json`,
      });
      const moduleObj = i;
      //console.log(module.data)
      moduleObj["prereqs"] = module.data.prerequisite;
    })
  );

  res.status(200).send(result);
});

exports.getData = app;
