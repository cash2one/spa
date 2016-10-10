<style>
    @import '../styles/page/comment.css';
</style>
<template>
    <div class="loading" v-show="$loadingRouteData"><i></i><i></i><i></i></div>
    <div class="page" id="comment-page" v-show="!$loadingRouteData" :class="{ 'already-comment' : orderType != 0 }">
        <div class="page-title"><a class="back" @click="doClickPageBack()"></a>评价</div>
        <div class="wrap thanks">
            <div>
                <div></div>
                <div>感谢您的评价!</div>
            </div>
        </div>
        <router-link class="wrap top-info" :to="{ name : 'technicianDetail' , query : { id : techId }}" tag="div">
            <div class="tech-header" :style="{ backgroundImage : 'url('+techHeader+')' }"></div>
            <div class="tech-info">
                <div>
                    <div>{{ techName }}</div>
                    <div>
                        <div class="stars"><div :style="{ width : techStars+'%'}"></div></div>
                        <div>{{ commentCount }}评论</div>
                    </div>
                </div>
                <div>编号【<span>{{ techNo }}</span>】</div>
            </div>
            <div class="right-arrow"></div>
        </router-link>
        <div class="comment-info wrap">
            <div class="title">服务评级</div>
            <div></div>
            <div class="item" v-for="item in commentItems">
                <div>{{ item.label }}</div>
                <div class="comment-stars">
                    <div @click="doClickCommentStar($event,item)"><div :style="{ width : item.value+'%' }"></div></div>
                </div>
                <div>{{ item.value | commentFormatter(item.type) }}</div>
            </div>
        </div>
        <div class="comment-impression wrap">
            <div class="title">印象点评<span>(最多3项)</span></div>
            <div class="comment-labels"><div v-for="item in impressionList" :key="item.id" @click="doClickImpressionItem(item)" :class="{ active : item.selected }">{{ item.tag }}</div></div>
            <div class="comment-text" v-show="!(orderType == 1 && commentInputText.length == 0)">
                <textarea maxlength="200" @focus="onTextareaFocus()" @blur="onTextareaBlur()" v-model="commentInputText" :readonly="orderType==1"></textarea>
                <div>200字以内哦~</div>
                <span :class="{ none : !showTextareaPlaceholder }">亲，点击这里，留句好评哦，么么哒~</span>
            </div>
            <div class="submit-btn" @click="doClickSubmitBtn()" :class="{ processing : inProcessing }">提交{{ inProcessing ? "中..." : "" }}</div>
        </div>
        <attention></attention>
    </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";
    import CommentFormatter from "../filters/comment-formatter";
    import Attention from '../components/attention';

    module.exports = {
        components: {
            'attention' : Attention
        },
        filters : {
            commentFormatter : CommentFormatter
        },
        data: function(){
            return {
                global : Global.data,
                queryImpressionListUrl : "../api/v2/club//impression/list",
                queryTechData : "../api/v2/club//shared/technician",
                submitUrl : "../api/v2/club//user/comment/create",
                orderId : "",
                techId : "",
                type : "",
                commentId : "",
                orderType : 0,
                techHeader : "",
                techName : "",
                commentCount : 0,
                commentInputText : "",
                showTextareaPlaceholder : true,
                inProcessing : false,
                impressionList : [],
                selectedImpression : [],
                commentItems : [ { label : "态度", value : 100, type : 0 }, { label : "仪容", value : 100, type : 0 }, { label : "技能", value : 100, type : 0 }, { label : "偷钟", value : 100, type : 1 }]
            }
        },
        route : {
            data : function(transition){
                var   _this = this, global = _this.global, query = global.currPageQuery, k, impressionLabelObj, selectedImpressionObj;
                _this.techId = query.techId;
                _this.orderId = query.orderId || query.id;
                _this.type = query.type || "";
                _this.commentId = query.commentId || "";

                _this.$http.get(_this.queryImpressionListUrl).then(function(res){
                    res = res.body;
                    if(res.statusCode == 200){
                        var list = res.respData;
                        impressionLabelObj = {};
                        for(k=0;k<list.length;k++){
                            if(selectedImpressionObj && selectedImpressionObj[list[k]["tag"]]){
                                list[k]["selected"] = true;
                            }
                            else{
                                list[k]["selected"] = false;
                            }
                            impressionLabelObj[list[k]["tag"]] = k;
                        }
                        _this.impressionList = list;
                    }
                    else{
                        Util.tipShow(res.msg || "查询印象标签数据出错！");
                    }
                });

                return new Promise(function(resolve,reject){
                    _this.$http.get(_this.queryTechData, { params : {
                        id : _this.orderId || _this.techId,
                        type : _this.type,
                        commentId : _this.commentId
                    }}).then(function(res){
                        res = res.body;
                        if(res.statusCode == 200){
                            res = res.respData;
                            var techInfo = res.tech, commentItems = _this.commentItems;
                            _this.orderType = res.allow;
                            if(_this.orderType == 1){
                                var commentData = res.comment;
                                _this.commentInputText = commentData.comment+"";
                                commentItems[0].value = commentData.attitudeRate;
                                commentItems[1].value = commentData.appearanceRate;
                                commentItems[2].value = commentData.skillRate;
                                commentItems[3].value = commentData.clockRate;

                                var impressionArr = commentData.impression.split('、'), i, impressionIndex, impressionObj;
                                selectedImpressionObj = {};
                                for(i=0;i<impressionArr.length;i++){
                                    selectedImpressionObj[impressionArr[i]] = true;
                                    if(impressionLabelObj){
                                        impressionIndex = impressionLabelObj[impressionArr[i]];
                                        impressionObj = _this.impressionList[impressionIndex];
                                        if(impressionObj){
                                            _this.impressionList.$set(impressionIndex,{ tag : impressionObj.tag, id : impressionObj.id, selected : true });
                                        }
                                    }
                                }
                            }
                            resolve({
                                techId : techInfo.id,
                                techHeader : techInfo.avatarUrl || global.defaultHeader,
                                techName : techInfo.name || global.defaultTechName,
                                commentCount : techInfo.commentCount || 0,
                                techNo : techInfo.serialNo || "无",
                                techStars : techInfo.star || 0
                            });
                        }
                        else{
                            Util.tipShow(res.msg || _this.global.loadDataErrorTip);
                            reject(false);
                            transition.abort();
                        }
                    },function(){
                        Util.tipShow(_this.global.loadDataErrorTip);
                        reject(false);
                        transition.abort();
                    });
                });
            }
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            doClickCommentStar : function(event,item){ //点击服务评级
                var _this = this;
                if(_this.orderType != 0) return;
                var v = Math.ceil((event.offsetX || event.layerX)/(8.611*16*_this.global.winScale*0.2)),
                        commentItems = _this.commentItems,
                        itemIndex = commentItems.indexOf(item);
                Vue.set(commentItems,itemIndex,{ value : v*20, type : item.type, label : item.label });
            },
            onTextareaFocus : function(){
                var _this = this;
                if(_this.orderType != 0) return;
                _this.showTextareaPlaceholder = false;
            },
            onTextareaBlur : function(){
                var _this = this;
                if(_this.orderType != 0) return;
                if(_this.commentInputText.length == 0){
                    _this.showTextareaPlaceholder = true;
                }
            },
            doClickSubmitBtn : function(){
                var _this = this, global = _this.global;
                if(_this.inProcessing){
                    Util.tipShow('正在提交评论，请稍候...');
                }
                else{
                    if(_this.orderType == 0){
                        _this.inProcessing = true;
                        var commentItems = _this.commentItems, impressionArr = [], list = _this.impressionList;
                        for(var i=0;i<list.length;i++){
                            if(list[i].selected){
                                impressionArr.push(list[i].tag);
                            }
                        }
                        _this.$http.post(_this.submitUrl,{
                            id : _this.orderId || _this.techId,
                            type : _this.type,
                            attitudeRate : commentItems[0].value,
                            appearanceRate : commentItems[1].value,
                            skillRate : commentItems[2].value,
                            clockRate : commentItems[3].value,
                            impression : impressionArr.join("、"),
                            comment : encodeURIComponent(_this.commentInputText)
                        }).then(function(res){
                            res = res.body;
                            if(res.statusCode == 200){
                                Util.tipShow(res.msg);
                                _this.orderType = 1;
                                _this.commentCount ++;
                                if(global.userAgent.isWX){
                                    _this.$router.push({ name : "techReward", query : { techId : _this.techId , commentId : res.respData || "" } });
                                }
                            }
                            else if(res.statusCode == 412){
                                Util.tipShow(res.msg || '您今天已经评论过该技师了');
                                history.back();
                            }
                            else{
                                Util.tipShow(res.msg || "评论出错！");
                            }
                            _this.inProcessing = false;
                        });
                    }
                    else{
                        Util.tipShow('此评论已提交。');
                    }
                }
            },
            doClickImpressionItem : function(impressionItem){
                var _this = this, k= 0, selectedList = _this.selectedImpression,impressionList = _this.impressionList;
                if(_this.orderType != 0) return;
                if(impressionItem.selected){//取消选中
                    var index = impressionList.indexOf(impressionItem);
                    Vue.set(impressionList,index,{ id : impressionItem.id, tag : impressionItem.tag, selected : false });
                    for(k=0;k<selectedList.length;k++){
                        if(selectedList[k] == impressionItem.id){
                            selectedList.splice(k,1);
                            break;
                        }
                    }
                }
                else{//增加选中
                    if(selectedList.length == 3){
                        for(k=0;k<impressionList.length;k++){
                            if(impressionList[k].id == selectedList[0]){
                                impressionList.$set(k,{ id : impressionList[k].id, tag : impressionList[k].tag, selected : false });
                                break;
                            }
                        }
                        selectedList.splice(0,1);
                    }
                    impressionList.$set(index,{ id : impressionItem.id, tag : impressionItem.tag, selected : true });
                    selectedList.push(impressionItem.id);
                }
            }
        }
    }
</script>