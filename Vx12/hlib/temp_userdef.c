int call_user_def(Display *display,char *funcName,char *fmt, ...)
{
    printf("user_def called \n");
    va_list args;
    int i=0;
    int j;
    char *str="%";
    char *list[20];
    Command *cmd = NULL;
    Socket *socket = NULL;
    int MAXARGS=32;
    union Data
    {
        int ivar;
        float fvar;
        char *svar;
        double dvar;
        long lvar;
    } data;
    data [MAXARGS]; 
    
    socket = display->socket;

    // for(j=0;j<20;j++)
    // {
    //     list[j]=calloc(50, sizeof(char));
    // }

    /* +1 for NULL terminator */

    va_start(args, fmt);
    while(*fmt)
    {
        switch(*fmt++){
            case 's':
                data[i].svar=strdup(va_arg(args, char *));
                strcat(str,"s");
                break;
            case 'i':
                data[i].ivar=va_arg(args, int);
                strcat(str,"d");
                break;
            case 'f':
                data[i].fvar=va_arg(args, float);
                strcat(str,"f");
                break;
            case 'd':
                data[i].dvar=va_arg(args, double);
                strcat(str,"f");
                break;
            case 'l':
                data[i].lvar=va_arg(args, long);
                strcat(str,"f");
                break;
        }
        i=i+1;
    }
    // for(i = 0; i < num; i++) {
    //     list[i] = va_arg(args, const char *);
    // }
    va_end(args);

    printf("function Name and 1st and 2nd arguments: %s %s %s \n",funcName, list[0], list[1]);
    switch(i)
    {
        case 1:
            cmd = command_format_json("USER_DEF", "\"%s\" \"%s\" \"%s\"",funcName, data[0]);
            break;
        case 2:
            cmd = command_format_json("USER_DEF", "\"%s\" \"%s\" \"%s\"",funcName, data[0],data[1]);
            break;
        case 3:
            cmd = command_format_json("USER_DEF", "\"%s\" \"%s\" \"%s\"",funcName, data[0],data[1],data[2]);
            break;
        case 4:
            cmd = command_format_json("USER_DEF", "\"%s\" \"%s\" \"%s\"",funcName, data[0],data[1],data[2],data[3]);
            break;
        case 5:
            cmd = command_format_json("USER_DEF", "\"%s\" \"%s\" \"%s\"",funcName, data[0],data[1],data[2],);
            break;
        case 6:
            cmd = command_format_json("USER_DEF", "\"%s\" \"%s\" \"%s\"",funcName, data[0],data[1]);
            break;
        case 7:
            cmd = command_format_json("USER_DEF", "\"%s\" \"%s\" \"%s\"",funcName, data[0],data[1]);
            break;
        case 8:
            cmd = command_format_json("USER_DEF", "\"%s\" \"%s\" \"%s\"",funcName, data[0],data[1]);
            break;
        case 9:
            cmd = command_format_json("USER_DEF", "\"%s\" \"%s\" \"%s\"",funcName, data[0],data[1]);
            break;


    }
    cmd = command_format_json("USER_DEF", "\"%s\" \"%s\" \"%s\"",funcName, list[0], list[1]);

    printf(cmd->command);


    if (cmd == NULL)
        return -1;
        
    if (command_send(cmd, socket) != 0) {
        command_free(cmd);
        return -1;
    }
    
    return 0;

}