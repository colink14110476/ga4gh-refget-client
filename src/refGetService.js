const CRAM_REF_URL="https://www.ebi.ac.uk/ena/cram/sequence"
const header={
	"cache-control":"no-cache",//"no-cache"
	/*"accept-ranges": "none",
	"Access-Control-Allow-Origin" : "*",
        "origin":"http://localhost:3000"*/

}

//Function to GET a reference sequence
//id - reference sequence md5 checksum
//start (OPT) - start postion
//end (OPT) - end postion
function getSequence(id,start,end) {
	let extra=""
	if (!isNaN(start)&&(start!=="")){
		extra+="?start="+start
	}
	if (!isNaN(end)&&(end!=="")){
		if(extra==="") extra+="?end="+end
        else extra+="&end="+end
	}

  return fetch(CRAM_REF_URL + "/" + id+extra, {
    method: "GET",
	headers: header,})
}

//Function to GET sequence metadata
function getSeqMetadata(id) {
  return fetch(CRAM_REF_URL + "/" + id + "/metadata", {
    method: "GET",
	headers: header,})
}

//Function to GET sequence service info
function getSeqInfo() {
  return fetch(CRAM_REF_URL + "/service-info", {
    method: "GET",
	headers: header,})
}

export {getSequence,getSeqMetadata,getSeqInfo};