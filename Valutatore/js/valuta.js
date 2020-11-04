function toggleMenu(num){
    if(num == 1){
        $('#chat').show();
        $('#valMenu').hide();
        $('#stylesheetDyn').attr("href", '/Valutatore/chat.css');
    }
    else{
        $('#chat').hide();
        $('#valMenu').show();
        $('#stylesheetDyn').attr("href", '/Valutatore/valuta.css');
    }
}