
function request(params) {
	var queryStr = ""
	var isGet = params.method==="GET"||params.method==="get"||params.method===undefined
	if(isGet){
		var queryObj = params.data || {}
		var keys = Object.keys(queryObj)
		keys.map((e,i)=>{
			queryStr += `${i===0?"?":""}${e}=${queryObj[e]}${i===keys.length-1?"":"&"}`
			return ""
		})
	}
	var queryInfo = {
		headers: {
			'Content-Type': 'application/json'
		},
		method: params.method || 'GET',
		credentials: "include",
	}
	if(!isGet){
		queryInfo.body = JSON.stringify(params.data)
	}
	return new Promise((resolve, reject) => {
		var xmlhttp=new XMLHttpRequest();
		xmlhttp.open(params.method || 'GET',window.location.origin + params.url + queryStr,true);
		xmlhttp.setRequestHeader('Content-Type', 'application/json');
		xmlhttp.onreadystatechange=function()
		{
			if (xmlhttp.readyState===4 && xmlhttp.status===200){
				resolve((JSON.parse(xmlhttp.responseText)))
			}
		}
		if(!isGet){
			xmlhttp.send(queryInfo.body);
		}else{
			xmlhttp.send();
		}
	})
};
export default request