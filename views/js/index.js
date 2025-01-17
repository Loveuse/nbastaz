var app = angular.module('nbastaz', ['ngMaterial']);

app.controller('playerCtrl', function($rootScope,$scope,$http) {
    var url = "/player?id="+$rootScope.player_id;

    $http.get(url)
    .success(function(response) {
      $scope.results = response;
      var size = $scope.results[0].gamelog.date.length;
      $scope.efr = [];
      for(i=0; i<size; i++){
        $scope.efr[i] = i;
      }
    });

});


app.controller("PaginationCtrl", function($scope, $http) {
  $scope.itemsPerPage = 24;
  $scope.currentPage = 0;
  $scope.items = [];
  $scope.names = [];
  $http.get("/players")
        .success(function(response) {
            $scope.results = response;

            $scope.size = $scope.results.length;
            for (key in response) {
                $scope.items.push(response[key]);
                $scope.names.push(response[key].name);
            }

            $scope.loadAll();

  });

  $scope.searchText    = "";
  $scope.isDisabled    = false;
  $scope.querySearch   = $scope.querySearchFunc;

  $scope.querySearchFunc= function(query) {

    if($scope.searchText == ""){
      $scope.loadAll()
      return $scope.players;
    }
    $scope.players = {}
    lowercase_query = angular.lowercase(query);

    size = $scope.names.length
    for (var key=0; key<size; key++){
      lower_key = angular.lowercase($scope.names[key])
      split_key = lower_key.split(" ")
      if(split_key[0].indexOf(lowercase_query) === 0 || split_key[1].indexOf(lowercase_query) === 0 || lower_key.indexOf(lowercase_query) === 0){
        $scope.players[$scope.names[key]] = $scope.names[key]
        for (item_key in $scope.items){
          lower_item_key = angular.lowercase($scope.items[item_key].name)
          split_item_name = lower_item_key.split(' ')
          if(split_item_name[0].indexOf(lowercase_query) === 0 || split_item_name[1].indexOf(lowercase_query) === 0 || lower_item_key.indexOf(lowercase_query) === 0){
            $scope.items_filtered[item_key] = $scope.items[item_key]
          }
         }
       }
    }
    return $scope.players;
   }

    $scope.loadAll = function() {
      $scope.players = {}
      $scope.items_filtered = {}
      size = $scope.names.length
      for (var i=0; i<size; i++){
        $scope.players[$scope.names[i]] = $scope.names[i]
      }
      for (key in $scope.items){
        $scope.items_filtered[key] = $scope.items[key]
        // console.log("LoadAll items, id "+key+" name "+$scope.items_filtered[key].name)
      }
    }

    $scope.filterPlayer = function(player){
      if($scope.searchText == "")
        return true
      player = angular.lowercase(player)
      split_player = player.split(" ")
      lower_searchText = angular.lowercase($scope.searchText)
      return split_player[0].indexOf(lower_searchText) === 0 || split_player[1].indexOf(lower_searchText) === 0 || player.indexOf(lower_searchText) === 0
    }

});


 app.controller('nextMatchController', function($scope, $http){
        var todayAll = Date.today();
        var month = todayAll.getMonth()+1;
        var day = todayAll.toFormat('DD');
        var year = todayAll.getFullYear();
        var today = month+'-'+day+'-'+year;
        $scope.nm=false;
        $scope.today = todayAll;
        $http.get("/matches?date="+today)
        .success(function(response) {$scope.results = response;$scope.nm=true;});
    });

    app.controller('prevMatchController', function($scope, $http,$rootScope){
        var date = Date.yesterday();
        var month = date.getMonth()+1;
        var day = date.toFormat('DD');
        var year = date.getFullYear();
        var yesterday = month+'-'+day+'-'+year;
        $scope.pm=false;
        $scope.yesterday = date;
        $http.get("/matches?date="+yesterday)
        .success(function(response) {
          if (response.length > 0) {
            $scope.results = response;
            $rootScope.prevmatches = response;
            $scope.pm=true;
            for (i in $scope.results){
              $scope.results[i].vteam.style = parseInt($scope.results[i].vteam.finl) > parseInt($scope.results[i].hteam.finl) ? {'font-weight' : 'bold'} : {'font-weight' : 'normal'};
              $scope.results[i].hteam.style = parseInt($scope.results[i].hteam.finl) > parseInt($scope.results[i].vteam.finl) ? {'font-weight' : 'bold'} : {'font-weight' : 'normal'};
            }
          }
          else {
            date.remove({'days' : 1});
            var month = date.getMonth()+1;
            var day = date.toFormat('DD');
            var year = date.getFullYear();
            var yesterday = month+'-'+day+'-'+year;
            $http.get("/matches?date="+yesterday)
            .success(function(response) {
              if (response.length > 0) {
                $scope.results = response;
                $scope.pm=true;
            }
            });
          }
        });
    });


    app.controller('standingsController',['$rootScope','$scope','$http',function($rootScope,$scope,$http){
        $scope.erange=[0,1,2,3,4,5,6,7,8,9,10,11,12,13,14];
        $scope.wrange=[15,16,17,18,19,20,21,22,23,24,25,26,27,28,29];
        $http.get("/standings")
        .success(function(response){
          $scope.results=response;
          $rootScope.team_name=$rootScope.team;
          $rootScope.teams = [];
          for(i = 0;i< response.length;i++){
          $rootScope.teams[i] = response[i].link.split('-')[response[i].link.split('-').length-1];
          }

          //console.log(response[0].link.split('-')[response[0].link.split('-').length-1]);
        })
    }]);


  app.controller('AppCtrl', ['$http','$rootScope','$scope', '$mdSidenav', 'pageService', '$timeout','$log', function($http,$rootScope,$scope, $mdSidenav, pageService, $timeout, $log) {
  var allPages = [];

  // $rootScope.val = 5;

  $http.get("/news")
  .success(function(response){
    $scope.news="";
    //console.log(response);
    for(i=0;i<response.length;i++){
      $scope.news+=response[i].descr;
      $scope.news+="    ";
    }
    //console.log($scope.news);
  });


  $rootScope.selected = null;
  $scope.pages = allPages;
  $scope.selectPage = selectPage;
  $scope.toggleSidenav = toggleSidenav;

  loadPages();

  //*******************
  // Internal Methods
  //*******************
  function loadPages() {
    pageService.loadAll()
      .then(function(pages){
        allPages = pages;
        $scope.pages = [].concat(pages);
        $rootScope.selected = $scope.pages[0];
      })
  }

  function toggleSidenav(name) {
    $mdSidenav(name).toggle();
  }

  function selectPage(page) {
    $rootScope.selected = angular.isNumber(page) ? $scope.pages[page] : page;
    $scope.toggleSidenav('left');
    //console.log($rootScope.selected);
  }
}])


app.service('pageService', ['$q', function($q) {
  var pages = [{
      name: 'Home',
      iconurl: '/icons/home.svg',
      href: '/home.html'
  }, {
      name: 'Teams',
      iconurl: '/icons/teams.svg',
      href: '/teams.html'
  }, {
      name: 'Players',
      iconurl:'/icons/player.svg',
      href: '/players.html'
  }, {
      name: 'Highlights',
      iconurl:'/icons/video.svg',
      href: '/highlights.html'
  }, {
      name: 'Standings',
      iconurl: '/icons/table.svg',
      href: '/standings.html'
  }];
  // Promise-based API
  return {
      loadAll: function() {
          // Simulate async nature of real remote calls
          return $q.when(pages);
      }
  };


}]);


/*********GRID LIST*******/

    app.controller('gridList', ['$rootScope','$scope','$http',function($rootScope,$scope,$http) {


      $http.get("/teams")
        .success(function(response){
          $scope.res=response;
          $scope.tiles = buildGridModel({
            icon : "",
            title: "",
            background: "",
            id:""
          });
        })


    function buildGridModel(tileTmpl){
      var it, results = [ ];
      var j=0;
      for (key in $scope.res) {
        it = angular.extend({},tileTmpl);
        it.id = key;
        it.icon  = $scope.res[key]['logo'];
        it.title = $scope.res[key]['team'];
        it.span  = { row : "1", col : "1" };
        it.background = "white";
         switch(j+1) {

          case 5:
            it.span.row = it.span.col = 1;
            //it.icon="http://content.sportslogos.net/logos/6/5120/thumbs/512019262015.gif";
            //it.span.row = it.span.col = 1;
            break;

        }
        results.push(it);
        j++;
      }
      return results;
    }
  }])

  /*********GRID LIST*******/

  app.controller('teamCtrl',['$rootScope','$scope','$http','$mdDialog',function($rootScope,$scope,$http,$mdDialog) {

    var url = "/team?abbr="+$rootScope.team_name;
    $rootScope.roles = {"PG":"Point Guard","SG":"Shooting Guard","PF":"Power Forward","SF":"Small Forward","C":"Center"}

    $http.get(url)
    .success(function(response) {
      $scope.results = response;
      //console.log(response);
    });

    var url_staz = "/team/stats?abbr="+$rootScope.team_name;

    $http.get(url_staz)
    .success(function(response){
      $scope.staz  = response;
      //console.log($scope.staz);
    });

    var url_roster = "/team/roster?abbr="+$rootScope.team_name;
    $http.get(url_roster)
    .success(function(response){
      $scope.roster = response;
      //console.log(response);
    });


    var url_depth = "/team/depth?abbr="+$rootScope.team_name;
    $http.get(url_depth)
    .success(function(response){
      $scope.depth = response;
    });

    var url_top = "/team/leaders?abbr="+$rootScope.team_name;
    $http.get(url_top)
    .success(function(response){
      $scope.leaders = response;
      //console.log(response);
    });


    $scope.showAdvanced = function(ev) {
    $rootScope.prange = [];
    for(i=1;i<$scope.depth[ev].names.length;i++){
      $rootScope.prange[i-1]=[i];
    }

    //console.log($scope.prange);

    $mdDialog.show({
      controller: DialogController,
      template: '<md-dialog ng-app="nbastaz" ng-controller="teamCtrl as tc">'+
    '<md-content class="sticky-container">'+
    '<md-toolbar class="md-theme-light"><h1 class="md-toolbar-tools">'+$rootScope.roles[$scope.depth[ev].pos]+'</h1></md-toolbar>'+
    '<div class="dialog-content"><h1 style="color:#0069b3">'+$scope.depth[ev].names[0]+'</h1>'+
    '<md-item data-ng-repeat="i in $root.prange"><md-item-content><div class="md-tile-content">{{depth['+ev+'].names[i]}}</div></md-item-content></md-item>'+
    '</div>',
      targetEvent: ev,
    })
  };

function DialogController($scope, $mdDialog) {
  $scope.hide = function() {
    $mdDialog.hide();
  };
  $scope.cancel = function() {
    $mdDialog.cancel();
  };
  $scope.answer = function(answer) {
    $mdDialog.hide(answer);
  };
}
}]);

app.controller('hController',function($scope,$http,$sce,$rootScope){

  function trust (src) {
    return $sce.trustAsResourceUrl(src);
  }

  var date = Date.yesterday();
  var month = date.getMonth()+1;
  var day = date.toFormat('DD');
  var year = date.getFullYear();
  var yesterday = month+'-'+day+'-'+year;
  $scope.yesterday=date;

  // $http.get("/top?date="+yesterday)
  // .success(function(tp){
  //   $scope.top_p = tp;
  // });

  $http.get("/topseason")
  .success(function(tp){
       $scope.top_p = tp;
       // console.log($scope.top_p[0]);
  });





  $scope.response = [];
  for (var i = 0; i<$rootScope.prevmatches.length; i++){
      $scope.vt = $rootScope.prevmatches[i].vteam.name;
      $http.get("/highlight?abbr="+$scope.vt).
      success(function(value){
        if (value != '')
          $scope.response.push(trust(JSON.parse(value).url));
      });
  }



});