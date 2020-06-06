import React from 'react';
import Box from '@material-ui/core/Box';


export default function FlexWrap() {
  var selectedDoc = "Washington, D.C., formally the District of Columbia and also known as D.C. or Washington, is the capital city of the United States of America. Founded after the American Revolution as the seat of government of the newly independent country, Washington was named after George Washington, the first president of the United States and a Founding Father. As the seat of the United States federal government and several international organizations, Washington is an important world political capital. The city, located on the Potomac River bordering Maryland and Virginia, is one of the most visited cities in the United States, with more than 20 million visitors annually.The signing of the Residence Act on July 16, 1790, approved the creation of a capital district located along the Potomac River on the country's East Coast. The U.S. Constitution provided for a federal district under the exclusive jurisdiction of the U.S. Congress, and the District is therefore not a part of any U.S. state. The states of Maryland and Virginia each donated land to form the federal district, which included the pre-existing settlements of Georgetown and Alexandria. The City of Washington was founded in 1791 to serve as the new national capital. In 1846, Congress returned the land originally ceded by Virginia, including the city of Alexandria; in 1871, it created a single municipal government for the remaining portion of the District. Washington had an estimated population of 705,749 as of July 2019, making it the 20th most populous city in the United States. Commuters from the surrounding Maryland and Virginia suburbs raise the city's daytime population to more than one million during the workweek. Washington's metropolitan area, the country's sixth largest (including parts of Maryland, Virginia and West Virginia), had a 2017 estimated population of 6.2 million residents.All three branches of the U.S. federal government are centered in the District: Congress (legislative), the president (executive), and the Supreme Court (judicial). Washington is home to many national monuments and museums, primarily situated on or around the National Mall. The city hosts 177 foreign embassies as well as the headquarters of many international organizations, trade unions, non-profits, lobbying groups, and professional associations, including the World Bank Group, the International Monetary Fund (IMF), the Organization of American States, AARP, the National Geographic Society, the Human Rights Campaign, the International Finance Corporation, and the American Red Cross. A locally elected mayor and a 13‑member council have governed the District since 1973. However, Congress maintains supreme authority over the city and may overturn local laws. D.C. residents elect a non-voting, at-large congressional delegate to the House of Representatives, but the District has no representation in the Senate. District voters choose three presidential electors in accordance with the Twenty-third Amendment to the United States Constitution, ratified in 1961. For statistical purposes, the District of Columbia is treated as a state-equivalent (and a county-equivalent) by the U.S. Census Bureau.";

  return (
    <div style={{ width: 200, height: 200, overflow: "scroll" }}>
      {/* <Box component="div" overflow="hidden" bgcolor="background.paper">
        {{selectedDoc}}
      </Box> */}
      <Box component="div" height="200" overflow="auto" bgcolor="background.paper">
        {selectedDoc}
      </Box>
    </div>
    // <div style={{ width: '100%' }}>



    //   <Box
    //     display="flex"
    //     flexDirection="column"
    //     flexWrap="wrap"
    //     p={1}
    //     m={1}
    //     bgcolor="background.paper"
    //     css={{ maxHeight: 300,"border-style": "solid" }}
        
    //   >
    //     {/* <div style={{ width: 200, height:200, whiteSpace: 'nowrap' }}>
    //       <Box p={1} bgcolor="grey.300" component="div" overflow="visible">
    //       {selectedDoc}
    //       </Box>
    //     </div> */}
        
    //     <Box p={1} bgcolor="grey.300">
    //       Item 2
    //     </Box>
    //     <Box p={1} bgcolor="grey.300">
    //       Item 3
    //     </Box>
    //     <Box p={1} bgcolor="grey.300">
    //       Item 4
    //     </Box>
    //     <Box p={1} bgcolor="grey.300">
    //       Item 5
    //     </Box>
    //     <Box p={1} bgcolor="grey.300">
    //       Item 6
    //     </Box>
    //     <Box p={1} bgcolor="grey.300">
    //       Item 1
    //     </Box>
    //     <Box p={1} bgcolor="grey.300">
    //       Item 2
    //     </Box>
    //     <Box p={1} bgcolor="grey.300">
    //       Item 3
    //     </Box>
    //     <Box p={1} bgcolor="grey.300">
    //       Item 4
    //     </Box>
    //     <Box p={1} bgcolor="grey.300">
    //       Item 5
    //     </Box>
    //     <Box p={1} bgcolor="grey.300">
    //       Item 6
    //     </Box>
    //   </Box>
    // </div>
  );
}
