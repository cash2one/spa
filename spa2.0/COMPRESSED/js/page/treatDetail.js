!function(){function e(e){switch(a.Text(t(e.authorizeCode)),s.Text((e.amount/100).toFixed(2)),"Y"==e.open?r.Text("朋友可见"):r.Text("朋友不可见"),i.Text(t(e.telephone,!0)),c.Attr("href","tel:"+e.telephone),n.Text(e.createDate),e.status){case"NOT_USERD":o.Text("未使用"),C.ClassClear("hide");break;case"CANCLED":o.Text("已取消"),p.Text(e.cancelDate),m.ClassClear("hide"),C.Class("hide");break;case"USED":o.Text("已使用"),u.Text(e.usedDate),l.Text((e.usedAmount/100).toFixed(2)),f.ClassClear("hide"),C.Class("hide")}C.Click(function(){T.Class("active")}),d.Click(function(){T.ClassClear("active")}),h.Click(function(){var e=$(h[0].parentNode);e.Class("processing"),$.ajax({url:"../api/v2/financial/account/payforother/cancel",isReplaceUrl:!0,type:"post",data:{detailId:x},success:function(t){e.ClassClear("processing"),"200"==t.statusCode?($.sessionStorage("treat_records_change_status",JSON.stringify({id:x,status:"CANCLED"})),o.Text("已取消"),T.ClassClear("active"),C.Class("hide"),m.ClassClear("hide"),p.Text($.commonDateFormat(new Date))):$.tipShow(t.msg||"取消授权失败")},error:function(t){e.ClassClear("processing"),$.tipShow(t||"出错")}})})}function t(e,t,a,s){if(e){var r=[],i="";t=t===!0,a=Math.abs(a||4),s=Math.abs(s||1),e=e.split(""),t&&(e=e.reverse());for(var c=s;c>0;c--)i+=" ";return e.forEach(function(e,t){r.push(e),(t+1)%a==0&&r.push(i)}),t&&r.reverse(),r.join("")}}var a=$("#treatCode"),s=$("#treatMoney"),r=$("#visFriend"),i=$("#treatTel"),c=$("#callPhone"),o=$("#treatStatus"),n=$("#treatTime"),l=$("#useMoney"),u=$("#useTime"),p=$("#cancelTime"),C=$("#sureBtn"),d=$(".cancel-btn"),h=$(".sure-btn"),T=$("#cancelTreat"),f=$("#useItem"),m=$("#cancelItem"),x=$.param("detailId")||$.getUrlParam("detailId")||"",g=$.param("backAccount"),v=$.sessionStorage("tmpTreat_cache")?JSON.parse($.sessionStorage("tmpTreat_cache")):"";return""==x?($.tipShow("参数不对。"),$.pageCancel()):("true"==g&&$("#title>div:nth-of-type(2)").Click(function(e){e.stopImmediatePropagation(),history.go(-2)}),v?($.sessionStorageClear("tmpTreat_cache"),e(v)):$.ajax({url:"../api/v2/financial/account/payforother/detail",isReplaceUrl:!0,type:"post",data:{detailId:x},success:function(t){"200"==t.statusCode?(t=t.respData,e(t)):$.tipShow(t.msg||"查询数据失败")}}),void $.pageSwitch())}();