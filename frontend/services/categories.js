(function(){
  function list(limit, offset){
    limit = typeof limit === 'number' ? limit : 100;
    offset = typeof offset === 'number' ? offset : 0;
    return $.Deferred(function(def){
      RestClient.get('categories?limit=' + encodeURIComponent(limit) + '&offset=' + encodeURIComponent(offset), function(resp){
        def.resolve(resp);
      }, function(err){ def.reject(err); });
    }).promise();
  }
  function getById(id){
    return $.Deferred(function(def){
      RestClient.get('categories/' + encodeURIComponent(id), function(resp){ def.resolve(resp); }, function(err){ def.reject(err); });
    }).promise();
  }
  function create(data){
    return $.Deferred(function(def){
      $.ajax({
        url: window.Constants.PROJECT_BASE_URL + 'categories',
        type: 'POST',
        beforeSend: function(xhr){ var t=localStorage.getItem('user_token'); if(t) xhr.setRequestHeader('Authentication', t); },
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json'
      }).done(function(resp){ def.resolve(resp); }).fail(function(err){ def.reject(err); });
    }).promise();
  }
  function update(id, data){
    return $.Deferred(function(def){
      $.ajax({
        url: window.Constants.PROJECT_BASE_URL + 'categories/' + encodeURIComponent(id),
        type: 'PUT',
        beforeSend: function(xhr){ var t=localStorage.getItem('user_token'); if(t) xhr.setRequestHeader('Authentication', t); },
        data: JSON.stringify(data),
        contentType: 'application/json',
        dataType: 'json'
      }).done(function(resp){ def.resolve(resp); }).fail(function(err){ def.reject(err); });
    }).promise();
  }
  function remove(id){
    return $.Deferred(function(def){
      $.ajax({
        url: window.Constants.PROJECT_BASE_URL + 'categories/' + encodeURIComponent(id),
        type: 'DELETE',
        beforeSend: function(xhr){ var t=localStorage.getItem('user_token'); if(t) xhr.setRequestHeader('Authentication', t); },
        dataType: 'json'
      }).done(function(resp){ def.resolve(resp); }).fail(function(err){ def.reject(err); });
    }).promise();
  }
  window.CategoriesService = { list, getById, create, update, remove };
})();
