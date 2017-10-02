var App = {
  init() {
    this.addListeners();
  },
  addListeners() {
    var btn = document.getElementById('start-mining');
    btn.addEventListener('click', this.mine);
  },
  mine(event) {
    event.preventDefault();
    fetch('/mine')
      .then(res => res.json())
      .then((res) => {
        console.log(res);
        var chain = $('#blockchain');
        var connector = $('#connector-template');
        var block = $('#block-template');

        block.find('.previous-hash').text(res.previousHash);
        block.find('.timestamp').text(res.timestamp);
        block.find('.proof').text(res.proof);
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
