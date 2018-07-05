var app = new Vue({
    el: "#app",
    data: {
        json: "https://api.myjson.com/bins/ytp9a",
        data: {},
        games: [],
        teams: [],
        maps: [],
        team: {},
        map: {},
        pageLocation: 0,
        backButtonLogic: [0],
        backgroundColorCounter: true,
        posts: [],
        allPosts: [],
        userLoged: false,
        loadingPost: true,
        userInfo: {},
        postsToShow: 20,
        showMorePostsButton: false,
    },
    created: function () {
        this.getData(this.json);
    },
    methods: {
        //Fetch Function
        getData: function (url) {
            fetch(url)
                .then(response => response.json())
                .then(json => {
                    console.log(json);
                    app.data = json;
                    this.isLoged();
                })
                .catch(error => console.log(error))
        },
        //Fill App Objects And Arrays
        fillGamesArray: function (games) {
            let array = [];
            for (let i = 0; i < games.length; i++) {
                let game = games[i];
                let object = {
                    id: {
                        host: game.host,
                        visitor: game.visitor
                    },
                    host: {
                        name: this.getTeamName(game.host),
                        shield: this.getTeamShield(game.host),
                    },
                    visitor: {
                        name: this.getTeamName(game.visitor),
                        shield: this.getTeamShield(game.visitor),
                    },
                    date: game.date,
                    location: {
                        name: game.location,
                        id: game.location.split(" ").join("_"),
                    },
                    month: game.month
                }
                array.push(object);
            }
            app.games = array;
        },
        fillTeamObject: function (team) {
            app.team = {
                name: app.getTeamName(team),
                shield: app.getTeamShield(team),
            }
        },
        fillTeamsArray: function () {
            const teams = this.data.teams;
            let array = [];
            for (team in teams) {
                let object = {
                    name: this.getTeamName(team),
                    shield: this.getTeamShield(team),
                    id: team,
                };
                array.push(object);
            }
            app.teams = array;
        },
        fillMapsArray: function () {
            const maps = this.data.locations;
            let array = [];
            for (map in maps) {
                let name = map.split("_").join(" ");
                let object = {
                    id: map,
                    name: name,
                    src: maps[map].iframe,
                    link: maps[map].link
                }
                array.push(object);
            }
            app.maps = array;
        },
        fillMapObject: function (map) {
            const maps = this.data.locations;
            let name = map.split("_").join(" ");
            let object = {
                name: name,
                src: maps[map].iframe,
                link: maps[map].link
            }
            app.map = object;
        },
        fillUserObject: function (post) {
            app.userInfo = {
                image: post.image,
                email: post.email,
                name: post.name,
            }
        },
        fillPostsArray: function () {
            let postsToShow = app.postsToShow;
            let array = [];
            const allPosts = app.allPosts;
            for (let i = allPosts.length; i > (allPosts.length - postsToShow); i--) {
                if (allPosts[i] != null) {
                    array.push(allPosts[i]);
                }
            }
            if (app.postsToShow == (array.length + 1)) {
                app.showMorePostsButton = true;
            } else {
                app.showMorePostsButton = false;
            }
            app.posts = array.reverse();

        },
        //Data Getters
        getTeamShield: function (team) {
            const shields = this.data.shields;
            return shields[team];
        },
        getTeamName: function (team) {
            const teams = this.data.teams;
            return teams[team];
        },
        getMatchLocation: function (location) {
            const locations = this.data.locations;
            return locations[location]
        },
        getFilteredGames: function (team) {
            const games = this.data.games;
            let array = [];
            for (let i = 0; i < games.length; i++) {
                if (games[i].host == team || games[i].visitor == team) {
                    array.push(games[i]);
                }
            }
            return array;

        },
        //Page Flow
        setTeamPage: function (team) {
            app.pageLocation = 3;
            this.addToBackButtonLogic(app.pageLocation);
            this.fillTeamObject(team);
            let newGames = this.getFilteredGames(team);
            this.fillGamesArray(newGames);
        },
        setGamesPage: function () {
            app.pageLocation = 1;
            this.addToBackButtonLogic(app.pageLocation);
            const games = app.data.games;
            this.fillGamesArray(games);
        },
        setHomePage: function () {
            app.pageLocation = 0;
            this.addToBackButtonLogic(app.pageLocation);
        },
        setTeamsPage: function () {
            app.pageLocation = 2;
            this.addToBackButtonLogic(app.pageLocation);
            this.fillTeamsArray()
        },
        setMapsPage: function () {
            app.pageLocation = 4;
            this.addToBackButtonLogic(app.pageLocation);
            this.fillMapsArray();
        },
        setMapPage: function (map) {
            app.pageLocation = 5;
            this.addToBackButtonLogic(app.pageLocation);
            app.fillMapObject(map);
        },
        setChatPage: function () {
            app.pageLocation = 6;
            this.addToBackButtonLogic(app.pageLocation);
        },
        //Set Background Color
        setBackgroundColor: function () {
            let counter = this.backgroundColorCounter;
            let color = "";
            if (counter == true) {
                color = "#f5f3dc"
            } else {
                color = "#dedcb9"
            }

            this.backgroundColorCounter = !counter;
            return color;
        },
        //Back Button Logic
        addToBackButtonLogic: function (pageLocation) {
            let array = app.backButtonLogic;
            if (array[array.length - 1] != pageLocation) {
                array.push(pageLocation);
            }
        },
        removeFromBackButtonLogic: function () {
            let array = app.backButtonLogic;
            if (array.length > 1) {
                array.splice(-1, 1)
                let lastPage = array[array.length - 1];
                app.pageLocation = lastPage;
            }
        },
        backButton: function () {
            app.removeFromBackButtonLogic();
        },
        //Chat Functions
        isLoged: function () {
            firebase.auth().onAuthStateChanged(function (user) {
                if (user != null) {
                    console.log("user signed in")
                    // User is signed in.
                    app.userLoged = true;
                    app.getPost();
                } else {
                    // No user is signed in.
                    app.userLoged = false;
                    app.getPost();
                }
            });

        },
        //Login Function
        login: function () {
            var provaider = new firebase.auth.GoogleAuthProvider();
            firebase.auth().signInWithPopup(provaider);
            this.isLoged();
            app.getPost();
        },
        //Logout function
        logout: function () {
            firebase.auth().signOut();
            this.isLoged();
            app.getPost();
        },
        writeNewPost: function () {
            //If there is no text and you try to post, return empty response
            if (!$("#write-txt").val()) {
                return
            }
            //Values to post, username, email, text to write, profile image, ... you can get as mani information as you want.
            const textToPost = document.getElementById("write-txt").value;
            const userName = firebase.auth().currentUser.displayName;
            const userEmail = firebase.auth().currentUser.email;
            const userPhoto = firebase.auth().currentUser.photoURL;
            //Post entity
            let dataToPost = {
                name: userName,
                text: textToPost,
                email: userEmail,
                image: userPhoto,
            };
            //Get an ID for a new post
            const newPost = firebase.database().ref().child("main-chat").push().key;

            //This ID is now the "KEY" of our new object
            let updates = {};
            updates["/main-chat/" + newPost] = dataToPost;

            document.getElementById("write-txt").value = "";
            return firebase.database().ref().update(updates);
            app.getPost();

        },
        //Get posts from Firebase Data Base
        getPost: function () {
            firebase.database().ref("main-chat").on("value", function (data) {
                const logs = document.getElementById("chat-window");
                const userEmail = firebase.auth().currentUser.email;

                let posts = data.val();
                console.log(posts.length)
                let allChatPosts = [];
                for (let key in posts) {
                    let element = posts[key];
                    if (element.email == userEmail) {
                        element["user"] = "host-post";
                    } else {
                        element["user"] = "other-post";
                    }
                    allChatPosts.push(element);
                }
                app.allPosts = allChatPosts;
                app.fillPostsArray();
                setTimeout(function () {
                    $("#chat-window").animate({
                        scrollTop: $("#chat-window").prop("scrollHeight")
                    });
                    app.loadingPost = false;
                }, 500)
            });
        },
        showMorePosts: function () {
            app.postsToShow += 20;
            app.fillPostsArray();
        },
    },
});









//var json = {
//   "games": [
//      {
//         "host": "U1",
//         "visitor": "U4",
//         "date": "9/01 9:30 a.m.",
//         "month": "September",
//         "location": "AJ Katzenmaier"
//      },
//      {
//         "host": "U3",
//         "visitor": "U2",
//         "date": "9/01 1:00 p.m.",
//         "month": "September",
//         "location": "Greenbay"
//      },
//      {
//         "host": "U5",
//         "visitor": "U6",
//         "date": "9/08 9:30 a.m.",
//         "month": "September",
//         "location": "Howard A Yeager"
//      },
//      {
//         "host": "U6",
//         "visitor": "U1",
//         "date": "9/08 1:00 p.m.",
//         "month": "September",
//         "location": "Marjorie P Hart"
//      },
//      {
//         "host": "U2",
//         "visitor": "U4",
//         "date": "9/15 9:30 a.m.",
//         "month": "September",
//         "location": "North Elementary"
//      },
//      {
//         "host": "U1",
//         "visitor": "U3",
//         "date": "9/15 1:00 p.m.",
//         "month": "September",
//         "location": "AJ Katzenmaier"
//      },
//      {
//         "host": "U1",
//         "visitor": "U3",
//         "date": "9/22 9:30 a.m.",
//         "month": "September",
//         "location": "South Elementary"
//      },
//      {
//         "host": "U2",
//         "visitor": "U6",
//         "date": "9/22 1:00 p.m.",
//         "month": "September",
//         "location": "Howard A Yeager"
//      },
//      {
//         "host": "U4",
//         "visitor": "U5",
//         "date": "9/29 9:30 a.m.",
//         "month": "September",
//         "location": "Greenbay"
//      },
//      {
//         "host": "U2",
//         "visitor": "U5",
//         "date": "10/06 9:30 a.m.",
//         "month": "October",
//         "location": "Marjorie P Hart"
//      },
//      {
//         "host": "U1",
//         "visitor": "U5",
//         "date": "10/06 1:00 p.m.",
//         "month": "October",
//         "location": "South Elementary"
//      },
//      {
//         "host": "U3",
//         "visitor": "U4",
//         "date": "10/13 9:30 a.m.",
//         "month": "October",
//         "location": "Howard A Yeager"
//      },
//      {
//         "host": "U5",
//         "visitor": "U1",
//         "date": "10/13 1:00 p.m.",
//         "month": "October",
//         "location": "Greenbay"
//      },
//      {
//         "host": "U6",
//         "visitor": "U3",
//         "date": "10/20 9:30 a.m.",
//         "month": "October",
//         "location": "North Elementary"
//      },
//      {
//         "host": "U2",
//         "visitor": "U4",
//         "date": "10/20 1:00 p.m.",
//         "month": "October",
//         "location": "Marjorie P Hart"
//      },
//      {
//         "host": "U3",
//         "visitor": "U1",
//         "date": "10/27 9:30 a.m.",
//         "month": "October",
//         "location": "AJ Katzenmaier"
//      },
//      {
//         "host": "U5",
//         "visitor": "U6",
//         "date": "10/27 1:00 p.m.",
//         "month": "October",
//         "location": "Howard A Yeager"
//      }
//   ],
//   "teams": {
//      "U1": "Goal Pumas",
//      "U2": "Black Rhinos",
//      "U3": "Tulsa Roughneck",
//      "U4": "Hoosier",
//      "U5": "PLZ",
//      "U6": "Fox Soccer"
//   },
//   "locations": {
//      "AJ_Katzenmaier": {
//         "link": "https://goo.gl/maps/ECfn4wtz1KR2",
//         "iframe": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2949.7810520615835!2d-87.86492878454477!3d42.32586847918918!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880f932fbc6ba7cd%3A0xcf2bbe275c6da815!2sA+J+Katzenmaier+Elementary+School!5e0!3m2!1sen!2snl!4v1529926420233"
//      },
//      "Greenbay": {
//         "link": "https://goo.gl/maps/FZMKzrXpQ1r",
//         "iframe": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2756.431112553894!2d-87.87117115853088!3d42.32105809607206!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880f933bce5af881%3A0x740a7a7d548adce1!2sGreenbay+Elementary+School+(K-5)!5e0!3m2!1sen!2snl!4v1529926465893"
//      },
//      "Howard_A_Yeager": {
//         "link": "https://goo.gl/maps/iZXkY1qM4162",
//         "iframe": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2950.270062631387!2d-87.85606978454513!3d42.3154382791899!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880feccac26b07c5%3A0x8b51fa5d6efe771a!2sHoward+A.+Yeager+School+(PREK-K)!5e0!3m2!1sen!2snl!4v1529926510016"
//      },
//      "Marjorie_P_Hart": {
//         "link": "https://goo.gl/maps/fGfQVqcBcVy",
//         "iframe": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2949.720311570161!2d-87.84787868454474!3d42.32716387918911!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880fecd0628e1bb5%3A0x9a4d5f9aafd42e02!2sMarjorie+P+Hart+Elementary+School!5e0!3m2!1sen!2snl!4v1529926546360"
//      },
//      "North_Elementary": {
//         "link": "https://goo.gl/maps/7j2RxHiPLDU2",
//         "iframe": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2969.336488231586!2d-87.64835588455797!3d41.90712467921989!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880fd33af13a8945%3A0xb6ad1ec2b6f379ba!2s1409+N+Ogden+Ave%2C+Chicago%2C+IL+60610%2C+USA!5e0!3m2!1sen!2snl!4v1529926580243"
//      },
//      "South_Elementary": {
//         "link": "https://goo.gl/maps/rrFByC6WmQN2",
//         "iframe": "https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d2968.7480203091422!2d-87.65355788455759!3d41.91977527921896!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x880fd3196fb41dc7%3A0x970be7f7d6336df5!2s2101+N+Fremont+St%2C+Chicago%2C+IL+60614%2C+USA!5e0!3m2!1sen!2snl!4v1529926612986"
//      }
//   },
//   "shields": {
//      "U1": "pumas-shield.png",
//      "U2": "black-rhinos-shield.png",
//      "U3": "tulsa-roughnecks-shield.png",
//      "U4": "hoosier-shield.png",
//      "U5": "plz-shield.png",
//      "U6": "fox-shield.png"
//   }
//}



getPosts: function () {
        firebase.database().ref('ubiqum').on('value', function (data) {

                var messages = data.val();
                var array = [];

                for (var key in messages) {

                    array.push(messages[key]);

                }
                app.messages = array;
            }
        }
