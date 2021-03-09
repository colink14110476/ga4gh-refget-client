import * as d3 from 'd3';

var y=null;                            //X variable used to change the x axis
var x=null;                            //Y variable used to change the y axis
var svg=null;                          //node containing the chart
var dataTable=null;                    //node containing the dataTable
var startPos=0;                        //X axis domain starting position
var maxCellLength=100;                 //Max number of cells to include in the chart
var endPos=startPos+maxCellLength;     //X axis domain ending position

//Chart Settings
var settings = {
  margin:{top: 60, right: 60, bottom: 60, left: 60},
  cellHeight:18,
  cellWidth:14,                  //If this changes change chartWidth
  chartWidth:14*maxCellLength,   //If this changes change cellWidth
  chartHeight:0,                 //We set to 0 since there should be no data in the chart initially, this is updated in addSeq/remSeq
  rectPadding:1
}


//CreateChart creates an empty genome chart.
//This function sets up nodes - x,y,svg,dataTable.
//seqChart = reference to the chart node.
//seqDataRef = a reference to object : {ids: list of id, data: list of seq strings}. seqDataRef excludes the latest sequence info. 
export function createChart(seqChart,seqDataRef){
  let dataSet=seqDataRef.current

  let width=settings.chartWidth+settings.margin.right+settings.margin.left
  let height=settings.chartHeight +settings.margin.top+settings.margin.bottom
  //Create Chart
  svg = d3.select(seqChart.current)
            .append('svg')
            .attr('id','genomeChart')
            .attr('width',width)
            .attr('height',height)

  //Add Title
  svg.append("text")
        .attr("x", (width / 2))             
        .attr("y", (settings.margin.top / 2))
        .attr("text-anchor", "middle")  
        .style("font-size", "16px") 
        .style("text-decoration", "underline")  
        .text("Reference Sequence Table");

  //Add X Axis
  x = d3.scaleLinear()
    .domain([startPos,endPos])  
    .rangeRound([settings.margin.left, settings.chartWidth + settings.margin.left]) //This sets up the position/length of the X axis
  svg.append("g")
    .call(xAxis);

  //Add Y Axis
  y=d3.scaleBand()
    .domain(dataSet.ids)
    .rangeRound([settings.margin.top, settings.margin.top + settings.chartHeight]) //This sets up the position/length of the Y axis  
  svg.append("g")
    .call(yAxis);

  //Create Empty Data Table
  dataTable = svg.append('g')
      .attr("transform",'translate('+settings.margin.left+',0)') //Shift the dataTable to the right a bit to avoid a overlap with the y-axis
      .attr('id','dataTable')
}

//addSeq adds the last sequence in the seqDataRef to the genome chart.
//When we add a new row, we need to increase the chart height, add a new y tick, add a new data row.
//seqDataRef = {ids: list of id, data: list of seq strings}. seqDataRef includes the latest sequence info. 
export function addSeq(seqDataRef){
  let dataSet=seqDataRef.current

  //Increase Chart Height
  settings.chartHeight+=settings.cellHeight
  svg.attr('height',settings.chartHeight + settings.margin.top + settings.margin.bottom)
  

  //Update Y Axis to include new sequence
  y.domain(dataSet.ids)  //Adjust the domain to include the new id. 
   .rangeRound([settings.margin.top,settings.margin.top + settings.chartHeight]) //Adjust the y axis position/length
  svg.select('#yAxis')
     .call(d3.axisLeft(y).tickSize(0)) //Create the ticks on the y-axis

  //Add new row to table
  //addRect takes in data in the form of [data1,data2,data3] where datai = {data:"GATC",id:"seq1"}
  dataTable.append('g')
           .data([{
                   data:dataSet.data[dataSet.count-1].substring(startPos,endPos),
                   id:dataSet.ids[dataSet.count-1]
                 }])
           .call(addRect)
}


//remSeq removes the last sequence from the genome chart.
//When we remove a new row, we need to decrease the chart height, remove a y tick, remove a data row.
//seqDataRef = {ids: list of id, data: list of seq strings}. seqDataRef excludes the latest sequence info. 
export function remSeq(seqDataRef){
  let dataSet=seqDataRef.current

  //Decrease Chart Height
  settings.chartHeight-=settings.cellHeight
  svg.attr('height',settings.chartHeight + settings.margin.top + settings.margin.bottom)

  //Update Y Axis to remove last sequence
  y.domain(dataSet.ids)  //seqDataRef already had the last sequence removed from it.
   .rangeRound([settings.margin.top,settings.margin.top + settings.chartHeight])
  svg.select('#yAxis')
     .call(d3.axisLeft(y).tickSize(0))

  //Remove last row from table
  dataTable.select('#seq'+(dataSet.count+1)+"Data")  //Note seqDataRef excludes the sequence we wanted to remove, thats why we use +1. 
           .remove()
}

//shiftTable shifts the x domain by 100 and redraws the genome sequence.
//seqDataRef = {ids: list of id, data: list of seq strings}. seqDataRef excludes the latest sequence info.
//dir = -1 to shift left, 0 to reset to the start, 1 to shift right.
export function shiftTable(seqDataRef,dir){
  let dataSet=seqDataRef.current

  //Update the start/end position by shifting.
  if(dir===0 || (dir===-1 && startPos<maxCellLength)){
    startPos=0;
    endPos=maxCellLength;
  }
  else{
    startPos+=dir*maxCellLength
    endPos+=dir*maxCellLength
  }

  //Update X Axis to the new domain values. 
  x.domain([startPos,endPos])
  svg.select('#xAxis')
     .call(d3.axisTop(x).ticks(null, "d"))   

  //Remove current rects
  dataTable.selectAll('g')
     .remove()

  //Add new rects.
  //addRect takes in data of the form: [data1,data2,data3] where datai = {data:"GATC",id:"seq1"}
  dataTable.selectAll('g')
     .data(dataSet.data.map((seq,i) => {return{
       data:seq.substring(startPos,endPos),
       id:'seq'+(i+1),
     }})) 
     .join('g').call(addRect)
}

//Updates the row group and inserts data into the 'g' node. 
//g - the node to insert the rectangles into. 
function addRect(g) {
  //Set the position of the 'g' row and set the id of the row.
  g.attr("transform", (d, i) => 'translate(0,'+y(d.id)+')')  
   .attr('id',(d,i) => (d.id + "Data"))                      
   
  //Add a 'rect' block to the row for each character in the genome string  
  g.selectAll('rect')
   .data(d=>d.data)                                          //Within the row we are now creating 'rect' blocks for each character in the genome string. Ex: d.data = "GATC"
   .join('rect')                              
      .attr('x', (d, i) => i*settings.cellWidth)                       //Set where the character 'rect' block starts. The i'th block should be in the i'th cell.
      .attr('width', settings.cellWidth-settings.rectPadding)          //Set the width of the block, rectPadding is probably 1 so theres a tiny white space between each block.
      .attr('height', d => settings.cellHeight-settings.rectPadding)   //Set the height, again we add padding to give white space between blocks. 
      .attr('fill', d => genomeColor(d))                               //Set the color of the block, G = Red
  
  //Add a 'text' node to the row for each character in the genome string. This overlays across the 'rect' block. 
  g.selectAll('text')                                        
   .data(d=>d.data) 
   .join('text')
      .attr('transform','translate(1,13)')  //Modify this to center text
      .attr('x', (d,i) => i*settings.cellWidth)
      .text((d,i) => d); 
}

//Function to create the Xaxis
function xAxis(g){
  g.attr("transform", 'translate(0,'+ settings.margin.top+')')
   .attr('id','xAxis')
   .call(d3.axisTop(x).ticks(null, "d"))   
}

//Function to create the Yaxis
function yAxis(g){
  g.attr("transform", 'translate('+settings.margin.left+',0)')
   .attr('id','yAxis')
   .call(d3.axisLeft(y).tickSize(0))
   .call(g => g.select(".domain").remove())
}

//Function to designate the color of each genome character.
function genomeColor(genomeCode){
  switch (genomeCode) {
    case 'C':
      return 'lightblue';
    case 'G':
      return 'orange';
    case 'T':
      return 'lightgreen';
    case 'A':
      return 'red';
    default:
      return 'white';
  }
}