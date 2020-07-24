(function (window) {
    var ua = navigator.userAgent.toLowerCase() || navigator.vendor || window.opera;
    var data = {
        searchTxt: "",
        viewHeight: document.body.clientHeight,
        AllowLogIn: false,
        groupId: "",
        userId: "",
        game: game,
        params: params,
        gameName: "",
        isFirst: true,
        work: "",
    }
    var vm = new Vue({
        el: "#main",
        data: data,
        computed: {
            PageHeight: function () {
                return this.viewHeight - 147 + "px"
            },
            quest_List: function () {
                var newList = [];
                for (var i = 0; i < this.allContent.length; i++) {
                    if (this.allContent[i].question.indexOf(this.searchTxt) != -1) {
                        newList.push(this.allContent[i])
                    }
                }
                return newList
            },
            args: function () {
                var ret = {};
                var str = this.params;
                if (!str) {
                    return ret;
                }
                var seg = str.replace(/^\?/, "").split('&');

                for (var i = seg.length - 1; i >= 0; i--) {
                    if (!seg[i]) {
                        continue;
                    }
                    var s = seg[i].split('=');
                    ret[s[0]] = s[1];
                }

                return ret;
            },
            canSubmit: function () {
                if (this.gameName != "" && this.work != "") {
                    return true
                } else {
                    return false
                }
            }
        },
        mounted: function () {
            this.viewHeight = document.body.clientHeight;
            window.addEventListener('resize', this.heightChange);
        },
        created: function () {
            if (this.args.groupId && this.args.userId) {
                this.groupId = this.args.groupId;
                this.userId = this.args.userId;
                this.isFirst = (this.args.isFirst == '1') ? false : true;
                if (this.isFirst == true) {
                    this.AllowLogIn = true;
                } else {

                    var xhr = new XMLHttpRequest();
                    var self = this;
                    xhr.open("GET", "https://spreadsheets.google.com/feeds/list/1K8IaCofyQGbxJD9tvzAWthDGGUyM_JwYuNhgBKbpSsA/1/public/values?alt=json");
                    xhr.send();
                    xhr.onreadystatechange = function () {
                        if (xhr.readyState == 4) {
                            if (xhr.status == 200) {
                                var data = JSON.parse(xhr.responseText);
                                var ListData = [];
                                var str;
                                for (var i = 0; i < data['feed']['entry'].length; i++) {
                                    if (data['feed']['entry'][i]['gsx$GroupID']['$t'] == this.groupId && data['feed']['entry'][i]['gsx$userID']['$t'] == this.userId) {
                                        this.gameName = data['feed']['entry'][i]['gsx$GameName']['$t'];
                                        this.GameWork = data['feed']['entry'][i]['gsx$Work']['$t'];
                                        this.AllowLogIn = true;
                                    }
                                }
                            }
                        }
                    }
                }

            }

        },

        methods: {
            heightChange: function (event) {
                var screenHeight = document.body.clientHeight;
                this.viewHeight = screenHeight;
            },
            submitForm: function () {
                var today = new Date();
                var self = this;
                var currentDateTime =

                    today.getFullYear() + '/' +

                    (today.getMonth() + 1) + '月/' +

                    today.getDate() + '日/' +

                    today.getHours() + ':' + today.getMinutes() +

                    ')';

                
                var jsonData = {
                    'time': currentDateTime,
                    'groupID': this.groupId,
                    'userID': this.userId,
                    'name': this.gameName,
                    'work': this.work,
                    'game': this.game
                };
                $.ajax({
                    type: "post",
                    url: "https://script.google.com/macros/s/AKfycbyq_Pqe593G_Z2kz3U2niiUGDOqDHx6-a8vTu8nKuZMz7oWKKU/exec",
                    data: jsonData,
                    dataType: "JSONP",
                    success: function (response) {
                        alert(response);
                        if (this.args.isFirst) {
                            location.reload();
                        } else {
                            window.location.href = window.location.href + "&isFirst=1"
                        }
                    }
                  });
            }

        }
    })
})(window);