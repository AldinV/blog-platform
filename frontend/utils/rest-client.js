(function(){
  function authHeader(xhr){
    try {
      var token = localStorage.getItem('user_token');
      if (token) xhr.setRequestHeader('Authentication', token);
    } catch(e) {}
  }

  function handleFail(jqXHR, error_callback){
    if (typeof error_callback === 'function') {
      error_callback(jqXHR);
      return;
    }
    var message = 'Request failed';
    if (jqXHR && jqXHR.responseJSON) {
      message = jqXHR.responseJSON.error || jqXHR.responseJSON.message || message;
    } else if (jqXHR && jqXHR.responseText) {
      message = jqXHR.responseText;
    }
    if (window.toastr && typeof window.toastr.error === 'function') {
      toastr.error(message);
    } else {
      console.error(message);
    }
  }

  var RestClient = {
    get: function(url, callback, error_callback){
      $.ajax({
        url: window.Constants.PROJECT_BASE_URL + url,
        type: 'GET',
        beforeSend: authHeader,
        success: function(response){ if (callback) callback(response); },
        error: function(jqXHR){ handleFail(jqXHR, error_callback); }
      });
    },
    request: function(url, method, data, callback, error_callback){
      $.ajax({
        url: window.Constants.PROJECT_BASE_URL + url,
        type: method,
        beforeSend: authHeader,
        data: data
      })
      .done(function(response){ if (callback) callback(response); })
      .fail(function(jqXHR){ handleFail(jqXHR, error_callback); });
    },
    post: function(url, data, callback, error_callback){ this.request(url, 'POST', data, callback, error_callback); },
    put: function(url, data, callback, error_callback){ this.request(url, 'PUT', data, callback, error_callback); },
    patch: function(url, data, callback, error_callback){ this.request(url, 'PATCH', data, callback, error_callback); },
    delete: function(url, data, callback, error_callback){ this.request(url, 'DELETE', data, callback, error_callback); }
  };

  window.RestClient = RestClient;
})();
