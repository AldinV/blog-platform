(function(){
  function list(limit, offset){
    limit = typeof limit === 'number' ? limit : 100;
    offset = typeof offset === 'number' ? offset : 0;
    return $.Deferred(function(def){
      RestClient.get('posts?limit=' + encodeURIComponent(limit) + '&offset=' + encodeURIComponent(offset), function(resp){
        def.resolve(resp);
      }, function(err){ def.reject(err); });
    }).promise();
  }
  function getById(id){
    return $.Deferred(function(def){
      RestClient.get('posts/' + encodeURIComponent(id), function(resp){ def.resolve(resp); }, function(err){ def.reject(err); });
    }).promise();
  }
  function getTags(id){
    return $.Deferred(function(def){
      RestClient.get('posts/' + encodeURIComponent(id) + '/tags', function(resp){ def.resolve(resp); }, function(err){ def.reject(err); });
    }).promise();
  }
  function getComments(postId, limit, offset){
    limit = typeof limit === 'number' ? limit : 100;
    offset = typeof offset === 'number' ? offset : 0;
    return $.Deferred(function(def){
      RestClient.get('posts/' + encodeURIComponent(postId) + '/comments?limit=' + encodeURIComponent(limit) + '&offset=' + encodeURIComponent(offset), function(resp){ def.resolve(resp); }, function(err){ def.reject(err); });
    }).promise();
  }
  window.PostsService = { list, getById, getTags, getComments };
})();
