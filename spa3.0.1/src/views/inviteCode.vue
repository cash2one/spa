<style>
    @import '../styles/page/inviteCode.css';
</style>
<template>
    <div class="page login-page" id="invite-code-page" v-show="!global.loading">
            <div class="page-title"><a class="back" @click="doClickPageBack()"></a>输入邀请码</div>
            <div class="code-input">
                <input placeholder="会所邀请码 (必填)" maxlength="6" v-model="inviteCode" @input="doInputInviteCode()"/>
                <input placeholder="技师编号 (选填)" maxlength="6" v-model="techNo" @input="doInputTechNo()"/>
            </div>
            <div class="submit-btn" :class="{ active : isInviteCodeValid && isTechNoValid }" @click="doClickSubmitBtn()">完成</div>
        </div>
</template>
<script>
    import { Global } from '../libs/global';
    import Util from "../libs/util";

    module.exports = {
        data: function(){
            return {
                global : Global.data,
                inviteCode : "",
                techNo : "",
                isInviteCodeValid : false,
                isTechNoValid : true,
                getClubTechUrl : "../api/v1/wx/club_tech_page_url"
            }
        },
        created : function(){
            var _this = this, global = _this.global;
            if(global.clubInviteCode){
                _this.inviteCode = global.clubInviteCode;
                _this.isInviteCodeValid = true;
            }
            if(global.techSerialNo){
                _this.techNo = global.techSerialNo;
            }

            if(_this.clubInviteCode && (global.techSerialNo || global.techInviteCode)){
                _this.doClickSubmitBtn();
            }
        },
        methods: {
            doClickPageBack : function(){
                history.back();
            },
            doClickSubmitBtn : function(){
                var _this = this, global = _this.global;
                if(_this.isInviteCodeValid && _this.isTechNoValid){
                    _this.$http.get(_this.getClubTechUrl,{ params : {
                        clubInviteCode : _this.inviteCode,
                        techSerialNo : _this.techNo || "",
                        techInviteCode : global.techInviteCode,
                        source : global.currPage.query["tmp_clubSource"] || ""
                    }}).then(function(res){
                        res = res.body;
                        if(res.statusCode == 200){
                            res = res.respData;
                            if(res.techInviteCode){
                                global.techInviteCode = res.techInviteCode;
                                Util.sessionStorage("techInviteCode",res.techInviteCode);
                            }
                            var urlObj = Util.urlFormat(res.linkUrl), paramArr = [];
                            if(global.techSerialNo) paramArr.push("techNo="+global.techSerialNo);
                            if(global.clubInviteCode) paramArr.push("clubCode="+global.clubInviteCode);

                            var targetUrl = urlObj.url+(paramArr.length>0 ? (urlObj.querys ? "&" : "?")+paramArr.join("&") : "");
                            console.log("跳转targetUrl："+targetUrl);

                            location.href = targetUrl;
                            location.reload(true);
                        }
                        else{
                            Util.tipShow(res.msg || "操作失败！");
                        }
                    });
                }
            },
            doInputInviteCode : function(){
                var _this = this;
                if (/\D/.test(_this.inviteCode)) {
                    _this.inviteCode = _this.inviteCode.replace(/\D/g, '');
                }
                if(_this.inviteCode.length>6){
                    _this.inviteCode = _this.inviteCode.substr(0,6);
                }
                _this.isInviteCodeValid = /^\d{3,}$/.test(_this.inviteCode);
            },
            doInputTechNo : function(){
                var _this = this;
                if (/\W/.test(_this.techNo)) {
                    _this.techNo = _this.techNo.replace(/\W/g, '');
                }
                if (_this.techNo.length > 6) {
                    _this.techNo = _this.techNo.substring(0, 6);
                }
                if(_this.techNo.length>0){
                    _this.isTechNoValid = /^\w{0,6}$/.test(_this.techNo);
                }
                else{
                    _this.isTechNoValid = true;
                }
            }
        }
    }
</script>