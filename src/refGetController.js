import * as refGetService from './refGetService.js'


//Controller to request for Genome Sequence and Metadata
//id - Reference Sequence MD5 checksum
//start (OPT) - Sequence start postion
//end (OPT) - Sequence end position
//Returns result, where if result.errMsg=="" then result.seq and result.metadata have values.
async function getSeq(id,start,end){
	let result={
		'errMsg':"",
		'seq':"",
		'metadata':{},
	}
	let response = await refGetService.getSequence(id,start,end)
  	switch (response.status) {
	    case 200:
	      result.seq= await response.text()
	      break;
	    case 206:
  	      result.seq= await response.text()
  	      break;
	    case 400:
	      result.errMsg="Bad Request."
	      break;
	    case 404:
	      result.errMsg="Unknown sequence MD5 checksum."
	      break;
	    case 415:
	      result.errMsg="Unsupported media type."
	      break;
	    case 416:
	      result.errMsg="Invalid sequence range."
	      break;
	    case 501:
	      result.errMsg="Not implemented."
	      break;
	    default:
	      result.errMsg="Error Occured. Please try again later."
	 }
	if (result.errMsg!=="") return result

	response = await refGetService.getSeqMetadata(id)
  	switch (response.status) {
	    case 200:
	      result.metadata= (await response.json()).metadata
	      break;
	    case 400:
	      result.errMsg="Bad Request."
	      break;
	    case 404:
	      result.errMsg="Unknown sequence MD5 checksum."
	      break;
	    default:
	      result.errMsg="Error Occured. Please try again later."
	 }
	 return result
}

//Controller to get the sequence info
function getSeqInfo(){
    refGetService.getSeqInfo()
      .then(response => response.json())
      .then(result => console.log(result))
      .catch(error => console.log('error', error));
}

export {getSeq,getSeqInfo}