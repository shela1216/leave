(function (window) {
    var ua = navigator.userAgent.toLowerCase() || navigator.vendor || window.opera;
    var data = {
        searchTxt: "",
        viewHeight: document.body.clientHeight,
        AllowLogIn: false,
        groupId: "",
        userId: "",
        password: "",
        game: game,
        lineName: "",
        params: params,
        gameName: "",
        groupName:"",
        isFirst: true,
        work: "",
        loading: false,
        ref: db.collection('botMember'),
        workref:db.collection('botWork'),
        allWork:[]
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
                if (this.gameName != "" && this.work != "" && this.loading != true &&this.password!="") {
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
                this.lineName = decodeURIComponent(escape(window.atob(this.args.UserName)));
                this.groupName= decodeURIComponent(escape(window.atob(this.args.groupName)));
                this.AllowLogIn = true;
                var self = this;
                var hadInfo =false;

                this.workref.get().then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        var data = doc.data();
                        self.allWork.push(data);

                    })
                })
                
                this.ref.get().then(querySnapshot => {
                    querySnapshot.forEach(doc => {
                        var data = doc.data();
                        var groupId = data['groupid'];
                        var userId = data['userid'];
                        if (groupId == self.groupId && userId == self.userId) {
                            hadInfo=true;
                            self.gameName = data['gameUser'];
                            self.work = data['gameWork'];
                        }
                    });

                    if(hadInfo){
                        self.isFirst = false;

                    }else{
                        self.isFirst = true;
                    }
                });

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
                this.loading = true;
                var ref = self.ref;
                var currentDateTime =

                    today.getFullYear() + '/' +

                    (today.getMonth() + 1) + '月/' +

                    today.getDate() + '日 ' +

                    today.getHours() + ':' + today.getMinutes();
                if (this.isFirst) {
                    var setDoc = ref.doc(self.userId+self.groupId);
                    setDoc.set({
                        gameUser: self.gameName,
                        gameWork: self.work,
                        groupid: self.groupId,
                        time: currentDateTime,
                        userName: self.lineName,
                        userid: self.userId,
                        password: self.password
                    }).then(() => {
                        alert("簽到成功");
                        window.location.reload();
                    });
                } else {
                    var setDoc = ref.doc(self.userId+self.groupId);
                    setDoc.get().then(doc => {
                        var data = doc.data()
                        if (data['password'] != self.password) {
                            alert("驗證碼錯誤無法送出")
                            window.location.reload();
                        } else {
                            setDoc.update({
                                gameUser: self.gameName,
                                gameWork: self.work,
                                time: currentDateTime,
                                userName: self.lineName,
                            }).then(() => {
                                alert("簽到成功");
                                window.location.reload();
                            });
                        }
                    });
                }

            }

        }
    })
})(window);