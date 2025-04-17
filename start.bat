@echo off

color 4
title Selfbot-Streaming-Rpc
echo -
echo -
ping localhost -n  >nul
cls
echo                                                                                  Cargando.
ping localhost -n 1 >nul
cls
echo                                                                                  Cargando..
echo                                                                             Preparando la Activacion
ping localhost -n 1 >nul
cls
Set /a num=(4)
color %num%
echo                                                                                  Cargando...
ping localhost -n 1 >nul
echo                                                                                  Iniciando
ping 127.0.0.1 -n 1 -w **500** > nul
echo                                                                                      1
ping localhost -n 1 >nul
echo                                                                                      2
ping localhost -n 1 >nul
echo                                                                                      3





cls
node index.js
echo COMPLETE
pause
goto top