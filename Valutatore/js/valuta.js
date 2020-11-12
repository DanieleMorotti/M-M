function toggleMenu(num){
    if(num == 1){
        $('#chat').show();
        $('#valMenu').hide();
        $('#optMenu').hide();
        $('#stylesheetDyn').attr("href", '/Valutatore/chat.css');
    }
    else if(num == 2){ 
        $('#chat').hide();
        $('#optMenu').hide();
        $('#valMenu').show();
        $('#stylesheetDyn').attr("href", '/Valutatore/valuta.css');
    }else{
        $('#chat').hide();
        $('#valMenu').hide();
        $('#optMenu').show();
        $('#stylesheetDyn').attr("href", '/Valutatore/settings.css');
    }
}