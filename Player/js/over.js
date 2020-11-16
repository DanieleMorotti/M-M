var story ;

export default {
    name: 'home',
    data() {
        return {
        }
    },
    template: `
        <div id="conclusionDiv" style="text-align: center">
            <h1>Partita finita</h1>
            <p>Grazie per aver giocato, speriamo tu ti sia divertito e possa ver imparato cose nuove!</p>
        </div> 
    `,
    activated() {
        $("body").css('background-image', 'none');
        $('body').css('background-color', 'black');
    }
}