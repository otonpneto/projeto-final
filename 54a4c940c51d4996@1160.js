// https://observablehq.com/@dnfeijo/panorama-de-casos-e-mortes-por-covid-19-no-brasil-2020-2021@1160
import define1 from "./e93997d5089d7165@2303.js";
import define2 from "./bea320d4938f0211@810.js";
import define3 from "./7a9e12f9fb3d8e06@459.js";
import define4 from "./a33468b95d0b15b0@808.js";

export default function define(runtime, observer) {
  const main = runtime.module();
  const fileAttachments = new Map([["brasil_estados.topojson",new URL("./files/101eb13411479aa1fa5f0c9e195161daa8f9cc8d43dabfb276c4c76d09d1dc3b2cbde90826a46956e359306b3b968af62aa6410d771065f583fa232d8c42eaa4",import.meta.url)],["casos_only_states.csv",new URL("./files/8a786891476c93b22051255931e8bad5384bfb0484a31b0d8c1b4129a0e7155a1f3e98cb0a2f76b4b1732b4ad8cf0c05b5caabd41a6da2b11160edbf44411600",import.meta.url)],["casos_only_states_last.csv",new URL("./files/f549da613bb267247660a42ccd84ae61367f00366439d0b3c5799864acb66c3dcba40facbc85395749b0b8ac96e29c0cec435244c1e5fffdf5594e1eaf87f1db",import.meta.url)]]);
  main.builtin("FileAttachment", runtime.fileAttachments(name => fileAttachments.get(name)));
  main.variable(observer()).define(["md"], function(md){return(
md`# Panorama de Casos e Mortes por Covid-19 no Brasil (2020-2021)`
)});
  main.variable(observer()).define(["md"], function(md){return(
md`#### Selecione que tipo de informações deseja ver: casos/mortes e qual região do Brasil`
)});
  main.variable(observer("viewof chosenData")).define("viewof chosenData", ["select"], function(select){return(
select(["Casos", "Mortes"])
)});
  main.variable(observer("chosenData")).define("chosenData", ["Generators", "viewof chosenData"], (G, _) => G.input(_));
  main.variable(observer()).define(["md"], function(md){return(
md`###  `
)});
  main.variable(observer("viewof region")).define("viewof region", ["select"], function(select){return(
select(["Todas", "Norte", "Nordeste", "Centro-Oeste", "Sudeste", "Sul", "Top5+", "Top5-"])
)});
  main.variable(observer("region")).define("region", ["Generators", "viewof region"], (G, _) => G.input(_));
  main.variable(observer("viewof dashboard")).define("viewof dashboard", ["vl","barGraph","scatter","br_map_view","plot2"], function(vl,barGraph,scatter,br_map_view,plot2)
{
  
  return vl.vconcat(vl.hconcat(barGraph, scatter), vl.vconcat(vl.hconcat(br_map_view, plot2)))
    //vl.vconcat(barGraph,vl.vconcat(vl.hconcat(br_map_view, scatter), vl.hconcat(plot2)))
    .resolve({scale: {size: 'independent'}})
    .render()
}
);
  main.variable(observer("dashboard")).define("dashboard", ["Generators", "viewof dashboard"], (G, _) => G.input(_));
  main.variable(observer("selected_legend")).define("selected_legend", ["chosenData","Legend","calendar"], function(chosenData,Legend,calendar)
{
  let key;
  chosenData == "Mortes" ? (key = Legend(calendar.scales.color, {title: 'Novas Mortes', marginLeft: 40})) : (key = Legend(calendar.scales.color, {title: 'Novos Casos', marginLeft: 40}));
  return key;
}
);
  main.variable(observer("calendar")).define("calendar", ["Calendar","cases","chosenData","weekday","width","colors"], function(Calendar,cases,chosenData,weekday,width,colors){return(
Calendar(cases, {
  x: d => new Date(d.trueDate),
  y: d => chosenData == "Mortes" ? (d.newDeaths) : (d.newCases),
  weekday,
  width,
  colors
})
)});
  main.variable(observer("cases")).define("cases", ["FileAttachment"], function(FileAttachment){return(
FileAttachment("casos_only_states.csv").csv()
  .then(function(cases) {
    cases.forEach(function callback(state, index) {
      state.deathsPer100k = (state.deaths * 100000) / state.estimated_population
      state.casesPer100k = (state.confirmed * 100000) / state.estimated_population
      if(index != 16993){
        if(cases[index].state == cases[index + 1].state){
          state.newDeaths = state.deaths - cases[index + 1].deaths
          state.newCases = state.confirmed - cases[index +1].confirmed
        } else {
          state.newDeaths = state.deaths
          state.newCases = state.confirmed
        }
      }
      const newDate = new Date(state.date)
      newDate.setDate(newDate.getDate() - 1)
      state.trueDate = newDate 
    });
    return cases;
  })
)});
  main.variable(observer("casesLast")).define("casesLast", ["FileAttachment"], function(FileAttachment){return(
FileAttachment("casos_only_states_last.csv").csv()
  .then(function(casesLast) {
    casesLast.forEach(function(state) {
      state.deathsPer100k = (state.deaths * 100000) / state.estimated_population
      state.casesPer100k = (state.confirmed * 100000) / state.estimated_population
    });
    return casesLast;
  })
)});
  main.variable(observer("br_topo")).define("br_topo", ["FileAttachment"], function(FileAttachment){return(
FileAttachment("brasil_estados.topojson").json()
)});
  main.variable(observer()).define(["vl","br_topo"], function(vl,br_topo){return(
vl.topojson(br_topo)
)});
  main.variable(observer("br_map_view")).define("br_map_view", ["chosenData","vl","br_topo","selected","casesLast","width"], function(chosenData,vl,br_topo,selected,casesLast,width)
{

  const mapcolor = (chosenData == "Casos") ? "blues" : "oranges";
  
  //base map of Brazil
  const mapDeaths = vl.markGeoshape({stroke: '#888', strokeWidth: 0.5})
  .data(vl.topojson(br_topo).feature('brasil_estados'))
  .transform(
    vl.filter({"field": "properties.uf_05", "oneOf": selected}),
    vl.lookup('properties.uf_05').from(vl.data(casesLast).key('state').fields('state', 'deathsPer100k'))
   )
  .encode(
    vl.color().fieldQ('deathsPer100k').scale({domain: [100, 400], type: 'quantize', clamp: true, scheme: {name: mapcolor, count: 10}}).legend({orient: 'top'}).title('Mortes por 100 mil habitantes'),
    vl.tooltip([{title: 'Estado', field: 'state'}, {title: 'Mortes por 100 mil habitantes', field: 'deathsPer100k', format: '.1f'}])
  )

  const mapCases = vl.markGeoshape({stroke: '#888', strokeWidth: 0.5})
  .data(vl.topojson(br_topo).feature('brasil_estados'))
  .transform(
    vl.filter({"field": "properties.uf_05", "oneOf": selected}),
    vl.lookup('properties.uf_05').from(vl.data(casesLast).key('state').fields('state', 'casesPer100k'))
   )
  .encode(
    vl.color().fieldQ('casesPer100k').scale({domain: [4000, 21000], type: 'quantize', clamp: true, scheme: {name: mapcolor, count: 10}}).legend({orient: 'top'}).title('Casos por 100 mil habitantes'),
    vl.tooltip([{title: 'Estado', field: 'state'}, {title: 'Casos por 100 mil habitantes', field: 'casesPer100k', format: '.1f'}])
  )

  var chosenMap;
  if(chosenData == "Mortes"){
    chosenMap = vl.layer(mapDeaths)
  } else {
    chosenMap = vl.layer(mapCases)
  }
    
  /*if(chosenData == "Mortes"){
    return vl.layer(mapDeaths)
    .width(width*0.50)
    .height(500)
  } else {
    return vl.layer(mapCases)
    .width(width*0.50)
    .height(500)
  }*/
  
  return vl.layer(chosenMap)
    .width(width*0.50)
    .height(500)
}
);
  main.variable(observer("sorted_cases_last")).define("sorted_cases_last", ["casesLast"], function(casesLast){return(
casesLast.sort
)});
  main.variable(observer("barGraph")).define("barGraph", ["chosenData","vl","color","casesLast","selected_data","selected","width"], function(chosenData,vl,color,casesLast,selected_data,selected,width)
{
  const titleY = (chosenData == "Casos") ? "Casos por 100 mil habitantes" : "Mortes por 100 mil habitantes";
  
  const graph = vl.markBar({color: color})
    //.title('Deaths By State')
    .data(casesLast)
    .encode(
      vl.y().fieldQ(selected_data).title(titleY),//.title('Deaths Per 100k habitants'),
      vl.x().fieldN('state').sort(vl.fieldQ(selected_data).order('descending')).title('Estados'),
      vl.tooltip([{title: 'Estado', field: 'state'}, {title: titleY, field: selected_data, format: '.1f'}])
    )
    .transform(
      vl.filter({"field": "state", "oneOf": selected})
    )

    return vl.layer(graph)
      .width(width*0.60)
      .height(400)
}
);
  main.variable(observer("scatter")).define("scatter", ["vl","color","casesLast","width"], function(vl,color,casesLast,width)
{
  const graph = vl.markCircle({
     color: color,
  })
  .encode(
    vl.x().scale({type: 'log'}).fieldQ("deaths").title('Mortes'),
    vl.y().scale({type: 'log'}).fieldQ("confirmed").title('Casos Confirmados'), 
    vl.tooltip([{title: 'Estado', field: 'state'}, {title: 'Mortes', field: 'deaths', format: '.1f'}, {title: 'Casos Confirmados', field: 'confirmed', format: '.1f'}])
  )
  .data(casesLast)

  return vl.layer(graph)
      .width(width*0.25)
      .height(300)
}
);
  main.variable(observer("plot2")).define("plot2", ["chosenData","vl","selected_data","cases","selected","width"], function(chosenData,vl,selected_data,cases,selected,width)
{
  const titleY = (chosenData == "Casos") ? "Casos por 100 mil habitantes" : "Mortes por 100 mil habitantes";
  
  // select a point for which to provide details-on-demand
  const hover = vl.selectPoint('hover')
    .encodings('x')  // limit selection to x-axis value
    .on('mouseover') // select on mouseover events
    .toggle(false)   // disable toggle on shift-hover
    .nearest(true);  // select data point nearest the cursor

  // predicate to test if a point is hover-selected
  // return false if the selection is empty
  const isHovered = hover.empty(false);
  
  // define our base line chart of stock prices
  const line = vl.markLine().encode(
    vl.x().fieldT("date").title('Data'),
    vl.y().fieldQ(selected_data).title(titleY), vl.color().fieldN("state"),
    vl.color().fieldN('state')
  );
  
  // shared base for new layers, filtered to hover selection
  const base = line.transform(vl.filter(isHovered));

  // mark properties for text label layers
  const label = {align: 'left', dx: 5, dy: -5};
  const white = {stroke: 'white', strokeWidth: 2};

  return vl.data(cases)
    .transform(
      vl.filter({"field": "state", "oneOf": selected})
    )
    .layer(
      line,
      // add a rule mark to serve as a guide line
      vl.markRule({color: '#aaa'})
        .transform(vl.filter(isHovered))
        .encode(vl.x().fieldT('date')),
      // add circle marks for selected time points, hide unselected points
      line.markCircle()
        .params(hover) // use as anchor points for selection
        .encode(vl.opacity().if(isHovered, vl.value(1)).value(0)),
      // add white stroked text to provide a legible background for labels
      base.markText(label, white).encode(vl.text().fieldQ(selected_data).format('.1f')),
      // add text labels for stock prices
      base.markText(label).encode(vl.text().fieldQ(selected_data).format('.1f'))
    )
    .width(width*0.32)
    .height(420)
}
);
  main.variable(observer("selected")).define("selected", ["region"], function(region)
{
  let states = [];
  
  switch (region) {
     case "Norte" :
        states = ["AC","RO","AM","RR","PA","AP","TO"];
        break;
     case "Nordeste" :
        states = ["MA","PI","CE","RN","PB","PE","AL","SE","BA"];
        break;
     case "Centro-Oeste" :
        states = ["MT","GO","MS","DF"];
        break;
     case "Sudeste" :
        states = ["MG","SP","ES","RJ"];
        break;
     case "Sul" :
        states = ["PR","SC","RS"];
        break;
     case "Top5+" :
        states = ["MT","RJ","RO","DF","PR"];
        break;
     case "Top5-" :
        states = ["MA","BA","AL","PA","AC"];
        break;
    case "Todas" :
      states = ["AC","RO","AM","RR","PA","AP","TO","MA","PI","CE","RN","PB","PE","AL","SE","BA","MT","GO","MS","DF","MG","SP","ES","RJ","PR","SC","RS","MT","RJ","RO","DF","PR","MA","BA","AL","PA","AC"];
      break;
  }
 
  return states;
}
);
  main.variable(observer("color")).define("color", ["chosenData"], function(chosenData)
{
  return (chosenData == "Casos") ? "#056FD9" : "#FD9E55";
}
);
  main.variable(observer("selected_data")).define("selected_data", ["chosenData"], function(chosenData)
{
  let data;
  chosenData == "Mortes" ? (data="deathsPer100k") : (data="casesPer100k");
  return data;
}
);
  main.variable(observer("viewof weekday")).define("viewof weekday", ["Inputs"], function(Inputs){return(
Inputs.select(new Map([
  ["Sunday-based weeks", "sunday"],
  ["Monday-based weeks", "monday"],
]))
)});
  main.variable(observer("weekday")).define("weekday", ["Generators", "viewof weekday"], (G, _) => G.input(_));
  main.variable(observer("colors")).define("colors", ["chosenData","d3"], function(chosenData,d3)
{
  let color;
  chosenData == "Mortes" ? (color=d3.scaleSequential(d3.interpolateOranges)) : (color=d3.scaleSequential(d3.interpolateBlues));
  return color;
}
);
  const child1 = runtime.module(define1);
  main.import("select", child1);
  const child2 = runtime.module(define2);
  main.import("Calendar", child2);
  const child3 = runtime.module(define3);
  main.import("howto", child3);
  const child4 = runtime.module(define4);
  main.import("Legend", child4);
  return main;
}
