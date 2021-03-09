import { fireEvent, render, screen,waitFor } from '@testing-library/react';
import { unmountComponentAtNode } from "react-dom";
import { act } from "react-dom/test-utils";
import React from "react";
import App from './App';
import * as refGetCtrl from './refGetController';

let container = null;
beforeEach(() => {
  // setup a DOM element as a render target
  container = document.createElement("div");
  document.body.appendChild(container);
});

afterEach(() => {
  // cleanup on exiting
  unmountComponentAtNode(container);
  container.remove();
  container = null;
});

test('test-App-Init', () => {  //
	act(() => {
	  render(<App />,container);
	})
	expect(document.getElementById('genomeChart')).toBeInTheDocument(); 
	expect(document.getElementById('sequenceFormId')).toBeInTheDocument();
});

test('test-App-Add-Seq', async () => {
    const fakeSeq = {
		'errMsg':"",
		'seq':"GATC",
		'metadata':{
		    "id": "3050107579885e1608e6fe50fae3f8d0",
		    "md5": "3050107579885e1608e6fe50fae3f8d0",
		    "trunc512": null,
		    "length": 7156,
		    "aliases": [{
		        "alias": "CH003448.1",
		        "naming_authority" : "INSDC"
		      },
		      {
		        "alias": "chr1",
		        "naming_authority" : "UCSC"
		      }]
  		},
	}
    let fetchMock=jest.spyOn(refGetCtrl,"getSeq").mockImplementation(() =>
      Promise.resolve(fakeSeq)
    )

	act(() => {
		render(<App />,container);
	})
	//No data should exist in the chart yet
	expect(document.getElementById('seq1Data')).not.toBeInTheDocument();

	//Insert data into the form and submit
	const inputField = document.getElementById('seqFormInputId')
	fireEvent.change(inputField,{target:{value:'1'}})	
	const submitButton = document.getElementById('submitButtonId'); 
	await act(async () => {
		submitButton.dispatchEvent(new MouseEvent('click',{bubbles:true}))	
	})

	expect(document.getElementById('seqTextArea').textContent).toBe('GATC')
	expect(document.getElementById('aliasTextArea').textContent).toBe('INSDC - CH003448.1\nUCSC - chr1\n')
	expect(document.getElementById('seq1Data')).toBeInTheDocument();
})
