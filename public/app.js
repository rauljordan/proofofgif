var App = {
  init() {
    setTimeout(() => {
      fetch('/node/register', {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ nodes: ['192.121.11.12'] })
      })
      .then((res) => {
        return res.json();
      })
      .then((res) => {
        $('.loading-circle').hide();
        $('.connected-circle').removeClass('hidden');
        $('.connecting-text').text(`Connected as Node 192.121.11.12`);
      });
    }, 2000);
    this.addListeners();
  },
  addListeners() {
    var btn = document.getElementById('start-mining');
    btn.addEventListener('click', this.mine);
  },
  mine(event) {
    event.preventDefault();
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

        for (let count = 0; count < 12121; count++) {
          (function(num) {
            setTimeout(function() {
              $('.nonce-counter').text(num);
              if (count === 12121 - 1) {
                $('.block-preview').addClass('hidden')
                $('.block-mined').removeClass('hidden');

                setTimeout(function() {
                  $('#loading-blockchain').addClass('hidden');
                  $('#blockchain').removeClass('hidden');
                }, 2000);
              }
            }, 10)
          })(count);
        }

        // $('#loading-blockchain').addClass('hidden');
        // $('#blockchain').removeClass('hidden');

        var chain = $('#blockchain');
        var connector = $('#connector-template');
        var block = $('#block-template');

        block.find('.previous-hash').text(res.previousHash);
        block.find('.timestamp').text(res.timestamp);
        block.find('.proof').text(res.proof);
        block.find('.block-gif').attr('src', res.data);

        chain.append(connector.html());
        chain.append(block.html());
      })
      .catch((err) => {
        console.log(err);
      });
  }
};

window.onload = function() {
  App.init();
};
