function toggleMenu(num,sub){
    if(num == 1){
        $('#chat').show();
        $('#valMenu').hide();
        $('#optMenu').hide();
        $('#changeNameMenu').hide();
        $('#printResults').hide();
        $('#stylesheetDyn').attr("href", '/Valutatore/css/chat.css');
    }
    else if(num == 2){ 
        $('#chat').hide();
        $('#changeNameMenu').hide();
        $('#optMenu').hide();
        $('#printResults').hide();
        $('#valMenu').show();
        $('#stylesheetDyn').attr("href", '/Valutatore/css/valuta.css');
    }else{
        $('#chat').hide();
        $('#valMenu').hide();
        $('#optMenu').show();
        $('#stylesheetDyn').attr("href", '/Valutatore/css/settings.css');
        if(sub == 1){
            $('#printResults').hide();
            $('#changeNameMenu').show();
        }
        else{
            $('#changeNameMenu').hide();
            $('#printResults').show();
        }
    }
}