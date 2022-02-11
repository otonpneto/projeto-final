# Panorama de Casos e Mortes por Covid-19 no Brasil (2020-2021)

https://observablehq.com/@dnfeijo/panorama-de-casos-e-mortes-por-covid-19-no-brasil-2020-2021@1160

View this notebook in your browser by running a web server in this folder. For
example:

~~~sh
npx http-server
~~~

Or, use the [Observable Runtime](https://github.com/observablehq/runtime) to
import this module directly into your application. To npm install:

~~~sh
npm install @observablehq/runtime@4
npm install https://api.observablehq.com/d/54a4c940c51d4996@1160.tgz?v=3
~~~

Then, import your notebook and the runtime as:

~~~js
import {Runtime, Inspector} from "@observablehq/runtime";
import define from "@dnfeijo/panorama-de-casos-e-mortes-por-covid-19-no-brasil-2020-2021";
~~~

To log the value of the cell named “foo”:

~~~js
const runtime = new Runtime();
const main = runtime.module(define);
main.value("foo").then(value => console.log(value));
~~~
