Okey, vamos a hacer lo sigueinte como el back no tiene una forma de ser accesado, vamos a usar la carpeta data para simular las llmadas, cada llamada a la api va a tene una hoja de codigo en donde va a simualr la llamada. 

Por ejemplo si pedimos la informciaond el user, esta pide a BACK/user/me y este devuelve un json con toda la data del user. 

Tiene que existir dentro de /src/data/user_me.js en donde tenga un metodo async (Tiene que ser async para simular cuando se ejecute el fetech en este metodo)

y el nomgre tiene que ser get_user_me()

como el back siemrpe va a dar error, vamos a hacer un mock con los datos que necesitamos traer del back, como tampoco sabemos si el back va a respodner en ese formato correcto, vamos a siempre usar este metodo o otros creados con la misma metodologia para pedir los datos del back, leugo cuando implementemos la union con el back vamos a usar este metodo para parsear los datos, por lo tanto siempre usa estos meotodos para pedir la informacion cada vez que se necesite.

****************************************

Vamos a ir desarollando la app por partes, primero vamos a crear el dashboard, el dashboard se compone de 4 partes:


-> Tituclo
-> Estadisticas
-> Progreso Grafico
-> Unidades recientes / egercios recientes


Crea las 4 partes.

En las estadisticas usa estos iconos
\public\Tiempo-01.png
\public\XP-01.png
\public\unidades-01-01.png
\public\Porcentaje Globnal-01.png

En la parte de graficos, usa el mismo color y el mismo formato que te paso en la foto

En las unidades/egercicios recientes, usa lo mismo que hay en la foto y en los iconos, usa estos que estan en: 
\public\libro.svg
\public\lapiz.svg
\public\auriculares.svg


*******************************************

Crea el dashboar cumpleindo con las normas ya aclaradas y lo mas similar a la foto que te paso.






********************************************


Okey ahora vamos con las unidades, aca vamos a tener lo mismo que antes: 

Pero ahora se dividen en 3

-> Titulo
-> Unidades
-> Progreso

Las fotos de las unidades, estan en: 

\public\basico.png
\public\calificado.png
\public\experto.png

\public\candado_clouse.svg
\public\candado_open.svg


Los botones de Ver hasta unidad ... llevan a unidad/basico o unidad/calificado que vamos a desarollar en otra parte. 


Copia el estilo de la foto, crea las 3 partes y utiliza los recursos que te deje mencionados para las fotos y iconos.


***********************************************



Okey, ahora vamos a desarollar la pagina de unidad/basico

Que vamos a crear lo que te paso en la foto, vas a ver que son varias unidades, la idea es usar las fotos de casos en cada unidad, como aun no savemos cuales son, usa las fotos de los casos alazar. 

public\basico\case1.png
public\basico\case2.png
public\basico\case3.png
public\basico\case4.png
public\basico\case5.png
public\basico\case6.png
public\basico\case7.png
public\basico\case8.png
public\basico\case9.png
public\basico\case11.png
public\basico\case12.png
public\basico\case13.png
public\basico\principal.png

Crea las 3 partes en como se divide esto: 

-> Foto principal con titulo
-> Buscador
-> Unidades

Crea todo como se ve en la foto con la aclaracion de que se usa un llamodo a la api para saber las unidades y cuales estan completeas, cuales no y en que estado estan. 



***************************************************


De la misma fomra como creamos /unidades/basico, vamos a crear la pagina de /unidades/calificado

vamos a usar en su luagr estas fotos: 

\public\calificado\case1.png
\public\calificado\case2.png
\public\calificado\case3.png
\public\calificado\case4.png
\public\calificado\case5.png
\public\calificado\case6.png
\public\calificado\case7.png
\public\calificado\case8.png
\public\calificado\case9.png
\public\calificado\case10.png
\public\calificado\case11.png
\public\calificado\case12.png
\public\calificado\case13.png
\public\calificado\case14.png
\public\calificado\case15.png
\public\calificado\case16.png
\public\calificado\principal.png


Si te pones a ver, es lo mismo que /unidades/basico pero cambian las fotos y la llamada a la api es diferente, por lo tanto ajusta eso.



**************************************************

Okey, ahora vamos a ejecutar la parte de bibloteca, bicloteca se compone de

-> /biblioteca
-> //biblioteca?shear=xxxx


Ahora vamos a implemntar el /biblioteca que se compone de:

-> Foto y titulo
-> Buscador
-> Filtros (Laterales)
-> Resultados
-> Filtros (Por capitulo)


Quiero que implemnetes todo y usa las imagenes en 

\public\bibloteca\cora_big.svg
\public\bibloteca\cora_empty.svg
\public\bibloteca\cora.svg
\public\bibloteca\image.svg
\public\bibloteca\pdf.svg
\public\bibloteca\principal.png
\public\bibloteca\word.svg

para implemntar todo. 

Te paso una foto de como se debe de ver la bibloteca cuando se esta buscando algo y leugo hacemos cuando este mostrando los resultados. 


********************************************************

Ahora vamos al perfil del usuario. (/perfil)


Implementa las partes :


-> Hero (foto) \public\perfil\principal.png
-> Foto del user.
-> Datos del user.
-> Progreso de aprendisaje.
-> Unidades y dias consecutivos.


*******************************************************

Okey, ahora vamos a meternos en la aprte de los modulos que serian los egercicios, estos egercicios pueden ser bastante variados


vamos a usar la pagina de /modulo/<egercicio>

Para renderizar todos, ahora vamos a renderizar algunos pero queiro que primero crees un rooter que me permita poder renderizar varias coasa en la misma pagina. 


Como el json de cada ejercicio va a cambiar segun lo que se renrice, vamos a ir haciendo una implemenzacion a la vez. 

Primero quiero que crees el rooter que va a encargarse de saber que rendireizar segun lo qeu vevulve la api. (Recuerda que estamos haceindo todo con un mock)

Luego de esto vamos a comenzar a implemntar el primer egercicio que es el que te paso en la foto ahora. 

Casi todos tienen el fomrato de la foto de arriba y leugo viene el egercicio, en este caso es:

Selecionar la opcion correcta. 

Las fotos que usemos van a estar en 

\public\ejercicio\principal1.png (Principalxx va a ser para la foto principal de cada caso)

Crea el ROuter e implmeneta el primer egercicio.


*********************************************************

Vamos a hacer ahora el egercicio dos, recuerda que todo lo que se necesita para cargar audios, url, respuestas todo, lo trae el back en un json que tienes que hacer un mock por el momento.


***********************************************************



\public\planes\grammar.svg
\public\planes\listening.svg
\public\planes\nivel1.png
\public\planes\nivel2.png
\public\planes\nivel3.png
\public\planes\principal1.png
\public\planes\pronunciation.svg
\public\planes\reading.svg
\public\planes\speaking.svg
\public\planes\vocabulary.svg





