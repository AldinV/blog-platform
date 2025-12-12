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
  function create(entity){
    return $.Deferred(function(def){
      $.ajax({
        url: window.Constants.PROJECT_BASE_URL + 'posts',
        type: 'POST',
        beforeSend: function(xhr){ var t=localStorage.getItem('user_token'); if(t) xhr.setRequestHeader('Authentication', t); },
        data: JSON.stringify(entity),
        contentType: 'application/json',
        dataType: 'json'
      }).done(function(resp){ def.resolve(resp); }).fail(function(err){ def.reject(err); });
    }).promise();
  }
  function update(id, entity){
    return $.Deferred(function(def){
      $.ajax({
        url: window.Constants.PROJECT_BASE_URL + 'posts/' + encodeURIComponent(id),
        type: 'PUT',
        beforeSend: function(xhr){ var t=localStorage.getItem('user_token'); if(t) xhr.setRequestHeader('Authentication', t); },
        data: JSON.stringify(entity),
        contentType: 'application/json',
        dataType: 'json'
      }).done(function(resp){ def.resolve(resp); }).fail(function(err){ def.reject(err); });
    }).promise();
  }
  function remove(id){
    return $.Deferred(function(def){
      $.ajax({
        url: window.Constants.PROJECT_BASE_URL + 'posts/' + encodeURIComponent(id),
        type: 'DELETE',
        beforeSend: function(xhr){ var t=localStorage.getItem('user_token'); if(t) xhr.setRequestHeader('Authentication', t); },
        dataType: 'json'
      }).done(function(resp){ def.resolve(resp); }).fail(function(err){ def.reject(err); });
    }).promise();
  }
  function setTags(id, tagIds){
    return $.Deferred(function(def){
      $.ajax({
        url: window.Constants.PROJECT_BASE_URL + 'posts/' + encodeURIComponent(id) + '/tags',
        type: 'PUT',
        beforeSend: function(xhr){ var t=localStorage.getItem('user_token'); if(t) xhr.setRequestHeader('Authentication', t); },
        data: JSON.stringify({ tag_ids: tagIds }),
        contentType: 'application/json',
        dataType: 'json'
      }).done(function(resp){ def.resolve(resp); }).fail(function(err){ def.reject(err); });
    }).promise();
  }
  window.PostsService = { list, getById, getTags, getComments, create, update, remove, setTags };
})();
