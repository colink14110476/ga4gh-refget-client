import React, { useState, useEffect, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Container,Navbar,Row,Button} from 'react-bootstrap'
import {createChart, addSeq, remSeq, shiftTable} from './components/genomeChart';
import './App.css';
import SequenceForm from './components/sequenceForm';

function App() {
  const seqChart = useRef(React.createRef())
  const [seqData, setSeqData] = useState({count:0,ids:[],data:[]})  
  const seqDataRef = useRef(seqData)

  //Button Handler to remove the last sequence in the genome chart. This triggers remSeq. 
  function buttonRemLastSeq(e){
    if (seqDataRef.current.count === 0) return;  //No need to remove anything else if the chart is empty.
    setSeqData(oldData => { 
      return{
        count:oldData.count-1,
        ids:oldData.ids.slice(0,oldData.count-1),
        data:oldData.data.slice(0,oldData.count-1),
      }
    })
  }

  //This is an on load effect. This means this is triggered only once when the page is initially loaded up.
  //This effect just generates an empty genome chart.
  useEffect(() => {
    createChart(seqChart,seqDataRef)
  },[])

  //This effect is triggered whenever seqData is modified. 
  //If data is added to seqData, we add a new row to the genome chart.
  //If data is removed from seqData, we remove the last row from the genome chart.
  useEffect(() => {
    let prevLength=seqDataRef.current.count
    seqDataRef.current=seqData

    if (prevLength<seqData.count){
      addSeq(seqDataRef)
    }
    else if(prevLength>seqData.count){
      remSeq(seqDataRef)
    }
  },[seqData])

  return (
    <div className="App" id="dashboard">
      <Navbar bg="dark" variant="dark">
        <Navbar.Brand>
          GA4GH Client App
        </Navbar.Brand>
      </Navbar>      
      <Container fluid style={{paddingTop:'50px'}}>
        <Row className="justify-content-md-center">
            <SequenceForm setSeqData={setSeqData} />
        </Row>
        <Row className="justify-content-md-center" style={{paddingTop:'20px',paddingBottom:'10px'}}>
          <Button variant="outline-secondary" size="sm" onClick={e => shiftTable(seqDataRef,-1)}>{'<'}</Button>&nbsp;
          <Button variant="outline-secondary" size="sm" onClick={e => shiftTable(seqDataRef,0)}>{'0'}</Button>&nbsp;
          <Button variant="outline-secondary" size="sm" onClick={e => shiftTable(seqDataRef,1)}>{'>'}</Button>&nbsp;
          <Button variant="outline-secondary" size="sm" onClick={buttonRemLastSeq}>Remove Last</Button>&nbsp;
        </Row>
        <Row className="justify-content-md-center">        
          <div style={{'backgroundColor': 'white'}}><div ref={seqChart}/></div>
        </Row>
      </Container>
    </div>
  );
}

export default App;