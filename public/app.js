var App = {
  init() {
    setTimeout(() => {
      fetch('/node/register', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        }
      })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        $('.loading-circle').hide();
        $('.connected-circle').removeClass('hidden');
        $('.connecting-text').text(`Connected as Node ${res.nodeAddress}`);
        $('.loading-all-nodes').hide();

        $('.current-nodes').removeClass('hidden');

        const otherNodes = res.totalNodes.filter(function(item) {
          //return item !== res.nodeAddress;
          return item !== 0;
        });

        for (let i = 0; i < otherNodes.length; i++) {
          $('.nodes-list').append(`<li>${otherNodes[i]}</li>`);
        }
      });
    }, 1000);
    this.addListeners();
  },
  addListeners() {
    var btn = document.getElementById('start-mining');
    var gif1 = document.getElementById('gif-1');
    var gif2 = document.getElementById('gif-2');
    var gif3 = document.getElementById('gif-3');
    var gif4 = document.getElementById('gif-4');
    gif1.addEventListener('click', this.copy);
    gif2.addEventListener('click', this.copy);
    gif3.addEventListener('click', this.copy);
    gif4.addEventListener('click', this.copy);

    btn.addEventListener('click', this.mine);
  },
  copy(event) {
    event.preventDefault();
    var ipt = document.getElementById('gif-input');
    ipt.value = event.target.href;
  },
  mine(event) {
    console.log(event);
    event.preventDefault();
    $('#gif-gallery').addClass('hidden');
    $('#loading-blockchain').removeClass('hidden');
    $('#blockchain').addClass('hidden');

    var gifUrl = $('#gif-input').val();
    fetch('/mine', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({ gif: gifUrl })
    })
      .then(res => res.json())
      .then((res) => {

        $('.nonce-start-text').addClass('hidden');
        $('.nonce-loader').removeClass('hidden')

        for (let count = 0; count < res.proof; count++) {
          (function(num) {
            setTimeout(function() {
              $('.nonce-counter').text(num);
              if (count === res.proof - 1) {
                $('.block-preview').addClass('hidden')
                $('.block-mined').removeClass('hidden');

                setTimeout(function() {
                  $('#loading-blockchain').addClass('hidden');
                  $('#blockchain').removeClass('hidden');

                  // Also reset all the other classes
                  $('.block-preview').removeClass('hidden');
                  $('.block-mined').addClass('hidden');
                  $('.nonce-start-text').removeClass('hidden');
                  $('.nonce-loader').addClass('hidden')
                }, 2000);
              }
            }, 5);
          })(count);
        }

        var chain = $('#blockchain');
        var connector = $('#connector-template');
        var block = $('#block-template');


        console.log(res);

        block.find('#hash').text(res.previousHash);
        block.find('#timestamp').text(res.timestamp);
        block.find('#proof').text(res.proof);
        block.find('.block-gif').attr('src', res.data);

        chain.append(connector.html());
        chain.append(block.html());
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

function copyToClipboard(text) {
  if (window.clipboardData && window.clipboardData.setData) {
    // IE specific code path to prevent textarea being shown while dialog is visible.
    return clipboardData.setData('Text', text); 

  } 
  else if (document.queryCommandSupported && document.queryCommandSupported('copy')) {
    var textarea = document.createElement('textarea');
    textarea.textContent = text;
    textarea.style.position = 'fixed';  // Prevent scrolling to bottom of page in MS Edge.
    document.body.appendChild(textarea);
    textarea.select();
    try {
      return document.execCommand('copy');  // Security exception may be thrown by some browsers.
    } catch (ex) {
      console.warn('Copy to clipboard failed.', ex);
      return false;
    } finally {
      document.body.removeChild(textarea);
    }
  }
}

window.onload = function() {
  App.init();
};
