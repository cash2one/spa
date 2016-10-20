/**
 * util.js
 */
module.exports = {
    data : {
        tip : document.querySelector("#app-tip"),
        defaultPrefix : "spa_"
    },
    tipShow : function(content, time) {
        var _tip = this.data.tip;
        if(!_tip){
            _tip=this.data.tip = document.querySelector("#app-tip");
        }
        _tip.children[0].innerHTML = content;
        _tip.classList.add('active');
        setTimeout(function () {
            _tip.classList.remove('active');
        }, (time || 3000));
    },
    localStorage : function(key, value, prefix){
        key = (prefix || this.data.defaultPrefix) + key;
        if (value) localStorage.setItem(key, value);
        else return localStorage.getItem(key);
    },
    removeLocalStorage : function(key, prefix){
        if (key) localStorage.removeItem((prefix || this.data.defaultPrefix) + key);
    },
    sessionStorage : function(key, value, prefix){
        key = (prefix || this.data.defaultPrefix) + key;
        if (value) sessionStorage.setItem(key, value);
        else return sessionStorage.getItem(key);
    },
    removeSessionStorage : function(key, prefix){
        if (key) sessionStorage.removeItem((prefix || this.data.defaultPrefix) + key);
    },
    md5 : function(r){
        var n,t,o,e,u,f,i,a,c,C=function(r,n){ return r<<n|r>>>32-n},g=function(r,n){var t,o,e,u,f;return e=2147483648&r,u=2147483648&n,t=1073741824&r,o=1073741824&n,f=(1073741823&r)+(1073741823&n),t&o?2147483648^f^e^u:t|o?1073741824&f?3221225472^f^e^u:1073741824^f^e^u:f^e^u},h=function(r,n,t){return r&n|~r&t},d=function(r,n,t){return r&t|n&~t},m=function(r,n,t){return r^n^t},v=function(r,n,t){return n^(r|~t)},S=function(r,n,t,o,e,u,f){return r=g(r,g(g(h(n,t,o),e),f)),g(C(r,u),n)},l=function(r,n,t,o,e,u,f){return r=g(r,g(g(d(n,t,o),e),f)),g(C(r,u),n)},A=function(r,n,t,o,e,u,f){return r=g(r,g(g(m(n,t,o),e),f)),g(C(r,u),n)},s=function(r,n,t,o,e,u,f){return r=g(r,g(g(v(n,t,o),e),f)),g(C(r,u),n)},x=function(r){for(var n,t=r.length,o=t+8,e=(o-o%64)/64,u=16*(e+1),f=Array(u-1),i=0,a=0;t>a;)n=(a-a%4)/4,i=a%4*8,f[n]=f[n]|r.charCodeAt(a)<<i,a++;return n=(a-a%4)/4,i=a%4*8,f[n]=f[n]|128<<i,f[u-2]=t<<3,f[u-1]=t>>>29,f},y=function(r){var n,t,o="",e="";for(t=0;3>=t;t++)n=r>>>8*t&255,e="0"+n.toString(16),o+=e.substr(e.length-2,2);return o},b=function(r){r=r.replace(/\x0d\x0a/g,"\n");for(var n="",t=0;t<r.length;t++){var o=r.charCodeAt(t);128>o?n+=String.fromCharCode(o):o>127&&2048>o?(n+=String.fromCharCode(o>>6|192),n+=String.fromCharCode(63&o|128)):(n+=String.fromCharCode(o>>12|224),n+=String.fromCharCode(o>>6&63|128),n+=String.fromCharCode(63&o|128))}return n},p=Array(),w=7,L=12,j=17,k=22,q=5,z=9,B=14,D=20,E=4,F=11,G=16,H=23,I=6,J=10,K=15,M=21;for(r=b(r),p=x(r),f=1732584193,i=4023233417,a=2562383102,c=271733878,n=0;n<p.length;n+=16)t=f,o=i,e=a,u=c,f=S(f,i,a,c,p[n+0],w,3614090360),c=S(c,f,i,a,p[n+1],L,3905402710),a=S(a,c,f,i,p[n+2],j,606105819),i=S(i,a,c,f,p[n+3],k,3250441966),f=S(f,i,a,c,p[n+4],w,4118548399),c=S(c,f,i,a,p[n+5],L,1200080426),a=S(a,c,f,i,p[n+6],j,2821735955),i=S(i,a,c,f,p[n+7],k,4249261313),f=S(f,i,a,c,p[n+8],w,1770035416),c=S(c,f,i,a,p[n+9],L,2336552879),a=S(a,c,f,i,p[n+10],j,4294925233),i=S(i,a,c,f,p[n+11],k,2304563134),f=S(f,i,a,c,p[n+12],w,1804603682),c=S(c,f,i,a,p[n+13],L,4254626195),a=S(a,c,f,i,p[n+14],j,2792965006),i=S(i,a,c,f,p[n+15],k,1236535329),f=l(f,i,a,c,p[n+1],q,4129170786),c=l(c,f,i,a,p[n+6],z,3225465664),a=l(a,c,f,i,p[n+11],B,643717713),i=l(i,a,c,f,p[n+0],D,3921069994),f=l(f,i,a,c,p[n+5],q,3593408605),c=l(c,f,i,a,p[n+10],z,38016083),a=l(a,c,f,i,p[n+15],B,3634488961),i=l(i,a,c,f,p[n+4],D,3889429448),f=l(f,i,a,c,p[n+9],q,568446438),c=l(c,f,i,a,p[n+14],z,3275163606),a=l(a,c,f,i,p[n+3],B,4107603335),i=l(i,a,c,f,p[n+8],D,1163531501),f=l(f,i,a,c,p[n+13],q,2850285829),c=l(c,f,i,a,p[n+2],z,4243563512),a=l(a,c,f,i,p[n+7],B,1735328473),i=l(i,a,c,f,p[n+12],D,2368359562),f=A(f,i,a,c,p[n+5],E,4294588738),c=A(c,f,i,a,p[n+8],F,2272392833),a=A(a,c,f,i,p[n+11],G,1839030562),i=A(i,a,c,f,p[n+14],H,4259657740),f=A(f,i,a,c,p[n+1],E,2763975236),c=A(c,f,i,a,p[n+4],F,1272893353),a=A(a,c,f,i,p[n+7],G,4139469664),i=A(i,a,c,f,p[n+10],H,3200236656),f=A(f,i,a,c,p[n+13],E,681279174),c=A(c,f,i,a,p[n+0],F,3936430074),a=A(a,c,f,i,p[n+3],G,3572445317),i=A(i,a,c,f,p[n+6],H,76029189),f=A(f,i,a,c,p[n+9],E,3654602809),c=A(c,f,i,a,p[n+12],F,3873151461),a=A(a,c,f,i,p[n+15],G,530742520),i=A(i,a,c,f,p[n+2],H,3299628645),f=s(f,i,a,c,p[n+0],I,4096336452),c=s(c,f,i,a,p[n+7],J,1126891415),a=s(a,c,f,i,p[n+14],K,2878612391),i=s(i,a,c,f,p[n+5],M,4237533241),f=s(f,i,a,c,p[n+12],I,1700485571),c=s(c,f,i,a,p[n+3],J,2399980690),a=s(a,c,f,i,p[n+10],K,4293915773),i=s(i,a,c,f,p[n+1],M,2240044497),f=s(f,i,a,c,p[n+8],I,1873313359),c=s(c,f,i,a,p[n+15],J,4264355552),a=s(a,c,f,i,p[n+6],K,2734768916),i=s(i,a,c,f,p[n+13],M,1309151649),f=s(f,i,a,c,p[n+4],I,4149444226),c=s(c,f,i,a,p[n+11],J,3174756917),a=s(a,c,f,i,p[n+2],K,718787259),i=s(i,a,c,f,p[n+9],M,3951481745),f=g(f,t),i=g(i,o),a=g(a,e),c=g(c,u);var N=y(f)+y(i)+y(a)+y(c);return N.toLowerCase()
    },
    dateFormat : function(date,format){
        format || (format = 'yyyy-MM-dd hh:mm:ss');
        var o = {
            "M+" : date.getMonth()+1,
            "d+" : date.getDate(),
            "h+" : date.getHours(),
            "m+" : date.getMinutes(),
            "s+" : date.getSeconds(),
            "q+" : Math.floor((date.getMonth()+3)/3),
            "S" : date.getMilliseconds()
        };

        if(/(y+)/.test(format)) {
            format = format.replace(RegExp.$1, (date.getFullYear()+"").substr(4 - RegExp.$1.length));
        }

        for(var k in o) {
            if(new RegExp("("+ k +")").test(format)) {
                format = format.replace(RegExp.$1, RegExp.$1.length==1 ? o[k] : ("00"+ o[k]).substr((""+ o[k]).length));
            }
        }
        return format;
    },
    stringToDate : function(str){//字符串YYYY-MM-DD hh:mm:ss 转日期Date类型
        if(!str) return;
        var tArr = str.split(" "), dateArr = tArr[0].split("-"), timeArr, date = new Date();
        if(dateArr.length == 3){
            date.setFullYear(dateArr[0]-0,dateArr[1]-1,dateArr[2]-0);
        }
        if(tArr[1]){
            timeArr = tArr[1].split(":");
            if(timeArr[0]) date.setHours(timeArr[0]-0);
            if(timeArr[1]) date.setMinutes(timeArr[1]-0);
            if(timeArr[2]) date.setSeconds(timeArr[2]-0);
        }
        return date;
    },
    spaceFormat : function(str,last,num,space){
        if(!str) return;
        var tmpArr = [],spaceStr='';
        last = last===true;
        num = Math.abs(num || 4);
        space = Math.abs(space || 1);
        str = str.split('');
        if(last){
            str = str.reverse();
        }
        for(var j=space;j>0;j--){
            spaceStr+=' ';
        }
        str.forEach(function (v, i) {
            tmpArr.push(v);
            if((i+1)%num == 0){
                tmpArr.push(spaceStr);
            }
        });
        if(last){
            tmpArr.reverse();
        }
        return tmpArr.join('');
    },
    urlFormat : function(url){
        var baseStr = url.split("?"),
            paramStr = baseStr[1],
            tempStr = paramStr,
            queryStr = paramStr.split("#"),
            k,
            paramObj = {},
            queryObj = null,
            tempArr,
            page;

        baseStr = baseStr[0].replace("/spa2","/spa").replace("sdcm163.stonebean.com","192.168.1.19:8051");
        paramStr = queryStr[0];
        queryStr = queryStr[1];

        if(paramStr){
            var paramArr = paramStr.split("&");
            for(k=0;k<paramArr.length;k++){
                tempArr = paramArr[k].split("=");
                if(tempArr.length == 2){
                    paramObj[tempArr[0]] = tempArr[1];
                }
            }
        }

        if(queryStr){
            var queryArr = queryStr.split("&");
            for(k=0;k<queryArr.length;k++){
                tempArr = queryArr[k].split("=");
                if(tempArr.length==1 && tempStr.indexOf("#"+tempArr[0])>=0){
                    page = tempArr[0];
                }
                else if(tempArr.length == 2){
                    if(!queryObj) queryObj = {};
                    queryObj[tempArr[0]] = tempArr[1];
                }
            }
        }

        url = baseStr+"?#/"+(paramObj.club ? paramObj.club+"/" : "")+page;

        if(queryObj){
            url += "?";
            tempArr = [];
            for(var item in queryObj){
                tempArr.push(item+"="+queryObj[item]);
            }
            url +=tempArr.join("&");
        }

        return {
            baseUrl : baseStr,
            page : page || "",
            params : paramObj,
            querys : queryObj,
            url : url
        }
    },
    pageReload : function(clubId,pageName,params){
        var url = location.host+location.pathname+"?#",
            paramsStr = "";
        if(clubId){
            url += "/"+clubId;
        }
        if(pageName){
            url += "/"+pageName;
        }
        if(params){
            var item, paramArr = [];
            for(item in params){
                paramArr.push(item+"="+params[item]);
            }
            paramsStr = paramArr.join("&");
            if(paramsStr){
                url += "?"+paramsStr;
            }
        }
        if(!/^http/.test(url)){
            url = "http://"+url;
        }
        location.href = url;
        location.reload(true);
    },
    assignIndex : function(arr){//给数组中的对象增加index属性
        for(var i=0;i<arr.length;i++){
            arr[i].index = i;
        }
        return arr;
    }
};