' Lanzador silencioso de BOTELLAPP.
' A diferencia de iniciar-botellapp.bat, este NO muestra ninguna ventana
' de terminal: arranca el servidor oculto y abre la app en una ventana
' propia (sin barra de direcciones ni pestañas), como cualquier programa
' instalado normal.
'
' Uso: doble clic (o crea un acceso directo en el Escritorio a este
' archivo, igual que se hizo con iniciar-botellapp.bat).

Set objShell = CreateObject("WScript.Shell")
Set objFSO = CreateObject("Scripting.FileSystemObject")

strRuta = objFSO.GetParentFolderName(WScript.ScriptFullName)
objShell.CurrentDirectory = strRuta

If Not objFSO.FolderExists(strRuta & "\node_modules") Then
    MsgBox "Falta instalar las dependencias." & vbCrLf & vbCrLf & _
        "Abre PowerShell en esta carpeta y ejecuta:" & vbCrLf & "npm install", _
        vbExclamation, "BOTELLAPP"
    WScript.Quit
End If

If Not objFSO.FileExists(strRuta & "\dev.db") Then
    MsgBox "Falta preparar la base de datos." & vbCrLf & vbCrLf & _
        "Abre PowerShell en esta carpeta y ejecuta:" & vbCrLf & _
        "npm run db:push" & vbCrLf & "npm run seed", _
        vbExclamation, "BOTELLAPP"
    WScript.Quit
End If

Function ServidorActivo()
    On Error Resume Next
    Dim http
    Set http = CreateObject("WinHttp.WinHttpRequest.5.1")
    http.SetTimeouts 1000, 1000, 1000, 1000
    http.Open "GET", "http://localhost:3000/", False
    http.Send
    ServidorActivo = (Err.Number = 0)
    On Error Goto 0
End Function

' Si ya hay un servidor corriendo (de una ventana anterior que no se
' cerró bien), no prendemos otro encima — eso es lo que causaba varios
' node.exe peleando por el puerto 3000 y páginas con error 404.
If Not ServidorActivo() Then
    ' 0 = sin ventana visible, False = no espera a que termine (el
    ' servidor queda corriendo de fondo)
    objShell.Run "cmd /c npm run dev", 0, False
    WScript.Sleep 7000
End If

' Abre en modo "app" de Edge: sin barra de direcciones ni pestañas.
objShell.Run "cmd /c start msedge --app=http://localhost:3000/login/rincon-patrimonial", 0, False
