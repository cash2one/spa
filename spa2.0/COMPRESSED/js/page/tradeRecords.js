!function(){function e(e,u){l||(l=!0,o=e||o+1,r.ClassClear("none"),c.Class("none"),d=!1,$.ajax({url:"../api/v2/financial/account/trades/"+n,isReplaceUrl:!0,data:{page:o,pageSize:g},success:function(e){if("200"!=e.statusCode)return $.tipShow(e.msg||"数据请求失败！");e=e.respData,i="";for(var n=!1,v=0,h=e.length;v<h;v++)n="income"==e[v].tradeType,i+="<div>                              <div>"+t[e[v].businessCategory]+'<span class="'+(n?"recharge":"")+'">'+(n?"+":"-")+(e[v].amount/100).toFixed(2)+"元</span>                                </div>                                <div>"+e[v].createDatetime+"</div>                            </div>";1==o?(p.Html(i),i?s.style.display="none":(s.style.display="block",d=!0),a=p[0].scrollHeight):(p.Html(i,!0),h<g&&(d=!0,c.ClassClear("none"))),l=!1,r.Class("none"),u&&u()}}))}var a,n=$.param("accountId")||$.getUrlParam("accountId")||"",t={consume:"账号消费",line_recharge:"线下充值",pay_for_other:"请客",user_recharge:"用户充值"},i="",s=$("#content div.nullData")[0],l=!1,o=0,r=$("#loadTip"),c=$("#finishTip"),d=!1,p=$(".trade-list"),u=$("#content"),g=10,v=.4;return""==n?($.tipShow("参数错误：缺少账户ID"),$.pageCancel()):(u.Event("scroll",function(n){!d&&u[0].scrollTop+u[0].clientHeight-(o+v-1)*a>=0&&e()}),e(),void $.pageSwitch(!0,!0))}();