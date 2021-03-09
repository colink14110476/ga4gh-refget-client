import React, { useState, useRef } from 'react';
import 'bootstrap/dist/css/bootstrap.min.css';
import {Row,Col,Button,Form} from 'react-bootstrap'
import * as refGetCtrl from '../refGetController';
import _ from 'lodash';

//Builds up the sequence form component to allow sequence id entry. 
//Upon button click the list of sequence data is updated and the genome chart is updated.
function SequenceForm({setSeqData}) {
    //STATES TO WATCH
    const [validated, setValidated] = useState(false);			//Validation for the form.
	const [errorMessage, setErrorMessage] = useState("")		//Error message to show after a GET occurs
	const [textAreaContent, setTextAreaContent] = useState("")	//Text area content to display Reference Sequence
	const [seqAliasText, setSeqAliasText]=useState("")			//Text area content to display known 

	//FORM CONTROL VALUES
  	const seqIdRef = useRef(null);
  	const seqStartRef = useRef(null);
  	const seqEndRef = useRef(null);

  	//Submit Button Handler.
  	//Upon submit, we first validate the form fields. 
  	//Then we send a GET request to retrieve the reference sequence data.
  	//Then we update the app's local sequence data and the textFields.
	function handleSubmit(e){
	  let seqIdVal=seqIdRef.current.value
	  let aliasText=""
	  //Validation Step
      const form = e.currentTarget;
      if (form.checkValidity() === false) {
        e.preventDefault();
        e.stopPropagation();
      }
      let validString = (_.isString(seqIdVal) && (/\S/.test(seqIdVal)))

      //GET Retrieval Step && data/field update
      if (validString) {

		refGetCtrl.getSeq(seqIdVal,seqStartRef.current.value,seqEndRef.current.value)
		.then(result => {
			//Check if the request was successful or not.
			if(result.errMsg === ""){
				//Setup aliasText to be None or a list of (authority - alias)
			    if (result.metadata.aliases.length===0) aliasText="None"
			    else{
				    for (var alias of result.metadata.aliases){
				    	aliasText+=alias.naming_authority + " - " + alias.alias + "\n"
				    }    	
			    }
			    //Update local data and update display fields. 
				setSeqData(oldData => {return{
						count:oldData.count+1,
						ids:[...oldData.ids,'seq'+(oldData.count+1)],
						data:[...oldData.data,result.seq]					
				}})
				setSeqAliasText(aliasText)					
				setErrorMessage("")
				setTextAreaContent(result.seq)
			}
			else{
				setErrorMessage(result.errMsg)
			}
		})
	  }
      setValidated(true);
	}

	return (<div style={{'width':'50%'}}>
    			<Form id="sequenceFormId" noValidate validated={validated}>
				  <Form.Row>
				    <Form.Group as={Col}>
				  	<Form.Label>Reference Sequence MD5 Checksum:</Form.Label>
				  	<Form.Control id='seqFormInputId' required placeholder="Reference Sequence MD5 Checksum" ref={seqIdRef}/>					    
				  	</Form.Group>
				  </Form.Row>
				  <Form.Row>
				  	<Form.Group as={Col}>
				      <Form.Label>Start:</Form.Label>
				      <Form.Control ref={seqStartRef} placeholder="0"/>
				    </Form.Group>
				    <Form.Group as={Col}>
				      <Form.Label>End:</Form.Label>
				      <Form.Control ref={seqEndRef} placeholder="20"/>
				    </Form.Group>
				  	</Form.Row>
				  <Form.Row className="justify-content-md-center">
				  	  <Button id='submitButtonId' variant="primary" onClick={handleSubmit}>Submit</Button>
				  </Form.Row>
				  <Form.Row>
				  	<Form.Group as={Col}>
			            <div style={{color: 'red',textAlign: 'center'}}>{errorMessage}</div>
					</Form.Group>
				  </Form.Row>      
	            </Form>		
	            <Row>
				  	<Col sm={8}>
				  		<label>Genome Reference Sequence</label>
					  	<textarea id='seqTextArea' rows="8" readOnly style={{'width':'100%'}} value={textAreaContent} placeholder="Ex: GTAATC"></textarea>
				  	</Col>
				   	<Col>
				   		<label>Authority - Alias </label>
				  		<textarea id='aliasTextArea' rows="8" readOnly style={{'width':'100%'}} value={seqAliasText} placeholder="Ex: UCSC - chr1"></textarea>
				  	</Col>
				  </Row>         		  					  	  	
	        </div>
        )
}

export default SequenceForm;