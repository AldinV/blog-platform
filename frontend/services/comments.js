(function(){
  function create(entity){
    return $.Deferred(function(def){
      $.ajax({
        url: window.Constants.PROJECT_BASE_URL + 'comments',
        type: 'POST',
        beforeSend: function(xhr){ var t=localStorage.getItem('user_token'); if(t) xhr.setRequestHeader('Authentication', t); },
        data: JSON.stringify(entity),
        contentType: 'application/json',
        dataType: 'json'
      }).done(function(resp){ def.resolve(resp); }).fail(function(err){ def.reject(err); });
    }).promise();
  }
  function list(limit, offset){
    limit = typeof limit === 'number' ? limit : 100;
    offset = typeof offset === 'number' ? offset : 0;
    return $.Deferred(function(def){
      RestClient.get('comments?limit=' + encodeURIComponent(limit) + '&offset=' + encodeURIComponent(offset), function(resp){ def.resolve(resp); }, function(err){ def.reject(err); });
    }).promise();
  }
  function listByPost(postId, limit, offset){
    limit = typeof limit === 'number' ? limit : 100;
    offset = typeof offset === 'number' ? offset : 0;
    return $.Deferred(function(def){
      RestClient.get('posts/' + encodeURIComponent(postId) + '/comments?limit=' + encodeURIComponent(limit) + '&offset=' + encodeURIComponent(offset), function(resp){ def.resolve(resp); }, function(err){ def.reject(err); });
    }).promise();
  }
  function remove(id){
    return $.Deferred(function(def){
      $.ajax({
        url: window.Constants.PROJECT_BASE_URL + 'comments/' + encodeURIComponent(id),
        type: 'DELETE',
        beforeSend: function(xhr){ var t=localStorage.getItem('user_token'); if(t) xhr.setRequestHeader('Authentication', t); },
        dataType: 'json'
      }).done(function(resp){ def.resolve(resp); }).fail(function(err){ def.reject(err); });
    }).promise();
  }
  function setStatus(id, status){
    return $.Deferred(function(def){
      $.ajax({
        url: window.Constants.PROJECT_BASE_URL + 'comments/' + encodeURIComponent(id) + '/status',
        type: 'PATCH',
        beforeSend: function(xhr){ var t=localStorage.getItem('user_token'); if(t) xhr.setRequestHeader('Authentication', t); },
        data: JSON.stringify({ status: status }),
        contentType: 'application/json',
        dataType: 'json'
      }).done(function(resp){ def.resolve(resp); }).fail(function(err){ def.reject(err); });
    }).promise();
  }
  window.CommentsService = { create, list, listByPost, remove, setStatus };
})();
