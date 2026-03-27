import React, { Component, useState, useRef } from 'react';
import { createRoot } from 'react-dom/client';
import { Stage, Layer, Image, Text, Rect, Transformer } from 'react-konva';
import useImage from 'use-image';

const id = [];
const side = Math.floor(2 * Math.random(1));
const religious = '1_016_05,1_016_22,1_165_08,1_167_04,1_168_12,1_168_13,1_169_04,1_169_08,1_169_20,1_175_07,1_177_12,1_179_21,1_184_03,1_184_04,1_184_05,1_184_07,1_184_13,1_184_14,1_184_18,1_184_19,1_184_20,1_184_22,1_184_23,1_184_24,1_184_25,2_082_13,2_082_22,2_083_01,2_116_01,2_116_04,2_116_05,2_116_11,2_116_12,2_116_13,2_116_16,2_119_03,2_119_04,2_119_05,2_119_09,2_119_14,2_119_23,2_119_26,2_155_01,2_155_02,2_155_03,2_155_04,2_155_05,2_155_06,2_155_07,2_155_08,2_155_09,2_155_10,2_155_11,2_155_12,2_155_15,2_155_17,2_155_18,2_155_19,2_155_20,2_155_22,2_155_23,2_155_26,2_156_01,angel_001,bronzeangel2,cross91-final,cross_001,cross_002,cross_003,cross_004,cross_005,cross_008,cross_010,cross_013,cross_021,cross_028,cross_029,cross_035,cross_036,cross_052,cross_054';

const inscriptions = [];
inscriptions.push("In Loving Memory");
inscriptions.push("Beloved by all who knew them");
inscriptions.push("Ours is love everlasting");
inscriptions.push("Death cannot part them");
inscriptions.push("Goodnight and God bless you");
inscriptions.push("Life is not forever – love is");
inscriptions.push("Gone but not forgotten");
inscriptions.push("Beloved");
inscriptions.push("Dearly beloved");
inscriptions.push("Adored");
inscriptions.push("So loved");
inscriptions.push("Into the sunshine");
inscriptions.push("Dearly loved");
inscriptions.push("Once met, never forgotten");
inscriptions.push("Uncompromisingly unique");
inscriptions.push("Remembered with love");
inscriptions.push("Love you always");
inscriptions.push("With a greater thing to do");
inscriptions.push("Love is enough");
inscriptions.push("Peace perfect peace");
inscriptions.push("Deep peace of the quiet earth to you");
inscriptions.push("Generous of heart, constant of faith");
inscriptions.push("Love you miss you");
inscriptions.push("So loved");
inscriptions.push("In everloving memory of");
inscriptions.push("Love is enough");
inscriptions.push("May his memory be eternal");
inscriptions.push("Always together");
inscriptions.push("Devoted in love");
inscriptions.push("Always loving, always loved");
inscriptions.push("Your love will light my way");
inscriptions.push("Asleep in Jesus");
inscriptions.push("Forever in our hearts");
inscriptions.push("Until we meet again");
inscriptions.push("Rest in Peace");
inscriptions.push("Here lies");
inscriptions.push("Ever loved");
inscriptions.push("Adored");
inscriptions.push("So loved");
inscriptions.push("An inspiration");
inscriptions.push("Loved and remembered");
inscriptions.push("In God's care");
inscriptions.push("An inspiration to all");
inscriptions.push("She walked in beauty");
inscriptions.push("Together again");
inscriptions.push("Love is waiting");
inscriptions.push("Once met, never forgotten");
inscriptions.push("A long life well lived");
inscriptions.push("Remembered with love");

const title = [];
title.push("Much loved wife");
title.push("Wife & Mother");
title.push("Husband & Father");
title.push("Loving husband and devoted father");
title.push("Beloved daughter, forever young");
title.push("Forever loved, forever missed");
title.push("Treasured by family and friends");

const name_m = ["John","William","James","Charles","George","Frank","Joseph","Thomas","Henry","Robert","Edward","Harry","Walter","Arthur","Fred","Albert","Samuel","David","Louis","Joe","Charlie","Clarence","Richard","Andrew","Daniel","Ernest","Will","Jesse","Oscar","Lewis","Peter","Benjamin","Frederick","Willie","Alfred","Sam","Roy","Herbert","Jacob","Tom","Elmer","Carl","Lee","Howard","Martin","Michael","Bert","Herman","Jim","Francis","Harvey","Earl","Eugene","Ralph","Ed","Claude","Edwin","Ben","Charley","Paul","Edgar","Isaac","Otto","Luther","Lawrence","Ira","Patrick","Guy","Oliver","Theodore","Hugh","Clyde","Alexander","August","Floyd","Homer","Jack","Leonard","Horace","Marion","Philip","Allen","Archie","Stephen","Chester","Willis","Raymond","Rufus","Warren","Jessie","Milton","Alex","Leo","Julius","Ray","Sidney","Bernard","Dan","Jerry","Calvin","Perry","Dave","Anthony","Eddie","Amos","Dennis","Clifford","Leroy","Wesley","Alonzo","Garfield","Franklin","Emil","Leon","Nathan","Harold","Matthew","Levi","Moses","Everett","Lester","Winfield","Adam","Lloyd","Mack","Fredrick","Jay","Jess","Melvin","Noah","Aaron","Alvin","Norman","Gilbert","Elijah","Victor","Gus","Nelson","Jasper","Silas","Jake","Christopher","Mike","Percy","Adolph","Maurice","Cornelius","Felix","Reuben","Wallace","Claud","Roscoe","Sylvester","Earnest","Hiram","Otis","Simon","Willard","Irvin","Mark","Jose","Wilbur","Abraham","Virgil","Clinton","Elbert","Leslie","Marshall","Owen","Wiley","Anton","Morris","Manuel","Phillip","Augustus","Emmett","Eli","Nicholas","Wilson","Alva","Harley","Newton","Timothy","Marvin","Ross","Curtis","Edmund","Jeff","Elias","Harrison","Stanley","Columbus","Lon","Ora","Ollie","Pearl","Russell","Solomon","Arch","Asa","Clayton","Enoch","Irving","Mathew","Nathaniel","Scott","Hubert","Lemuel","Andy","Ellis","Emanuel","Joshua","Millard","Vernon","Wade","Cyrus","Miles","Rudolph","Sherman","Austin","Bill","Chas","Lonnie","Monroe","Byron","Edd","Emery","Grant","Jerome","Max","Mose","Steve","Gordon","Abe","Pete","Chris","Clark","Gustave","Orville","Lorenzo","Bruce","Marcus","Preston","Bob","Dock","Donald","Jackson","Cecil","Barney","Delbert","Edmond","Anderson","Christian","Glenn","Jefferson","Luke","Neal","Burt","Ike","Myron","Tony","Conrad","Joel","Matt","Riley","Vincent","Emory","Isaiah","Nick","Ezra","Green","Juan","Clifton","Lucius","Porter","Arnold","Bud","Jeremiah","Taylor","Forrest","Roland","Spencer","Burton","Don","Emmet","Gustav","Louie","Morgan","Ned","Van","Ambrose","Chauncey","Elisha","Ferdinand","General","Julian","Kenneth","Mitchell","Allie","Josh","Judson","Lyman","Napoleon","Pedro","Berry","Dewitt","Ervin","Forest","Lynn","Pink","Ruben","Sanford","Ward","Douglas","Ole","Omer","Ulysses","Walker","Wilbert","Adelbert","Benjiman","Ivan","Jonas","Major","Abner","Archibald","Caleb","Clint","Dudley","Granville","King","Mary","Merton","Antonio","Bennie","Carroll","Freeman","Josiah","Milo","Royal","Dick","Earle","Elza","Emerson","Fletcher","Judge","Laurence","Neil","Roger","Seth","Glen","Hugo","Jimmie","Johnnie","Washington","Elwood","Gust","Harmon","Jordan","Simeon","Wayne","Wilber","Clem","Evan","Frederic","Irwin","Junius","Lafayette","Loren","Madison","Mason","Orval","Abram","Aubrey","Elliott","Hans","Karl","Minor","Wash","Wilfred","Allan","Alphonse","Dallas","Dee","Isiah","Jason","Johnny","Lawson","Lew","Micheal","Orin","Addison","Cal","Erastus","Francisco","Hardy","Lucien","Randolph","Stewart","Vern","Wilmer","Zack","Adrian","Alvah","Bertram","Clay","Ephraim","Fritz","Giles","Grover","Harris","Isom","Jesus","Johnie","Jonathan","Lucian","Malcolm","Merritt","Otho","Perley","Rolla","Sandy","Tomas","Wilford","Adolphus","Angus","Arther","Carlos","Cary","Cassius","Davis","Hamilton","Harve","Israel","Leander","Melville","Merle","Murray","Pleasant","Sterling","Steven","Axel","Boyd","Bryant","Clement","Erwin","Ezekiel","Foster","Frances","Geo","Houston","Issac","Jules","Larkin","Mat","Morton","Orlando","Pierce","Prince","Rollie","Rollin","Sim","Stuart","Wilburn","Bennett","Casper","Christ","Dell","Egbert","Elmo","Fay","Gabriel","Hector","Horatio","Lige","Saul","Smith","Squire","Tobe","Tommie","Wyatt","Alford","Alma","Alton","Andres","Burl","Cicero","Dean","Dorsey","Enos","Howell","Lou","Loyd","Mahlon","Nat","Omar","Oran","Parker","Raleigh","Reginald","Rubin","Seymour","Wm","Young","Benjamine","Carey","Carlton","Eldridge","Elzie","Garrett","Isham","Johnson","Larry","Logan","Merrill","Mont","Oren","Pierre","Rex","Rodney","Ted","Webster","West","Wheeler","Willam","Al","Aloysius","Alvie","Anna","Art","Augustine","Bailey","Benjaman","Beverly","Bishop","Clair","Cloyd","Coleman","Dana","Duncan","Dwight","Emile","Evert","Henderson","Hunter","Jean","Lem","Luis","Mathias","Maynard","Miguel","Mortimer","Nels","Norris","Pat","Phil","Rush","Santiago","Sol","Sydney","Thaddeus","Thornton","Tim","Travis","Truman","Watson","Webb","Wellington","Winfred","Wylie","Alec","Basil","Baxter","Bertrand","Buford","Burr","Cleveland","Colonel","Dempsey","Early","Ellsworth","Fate","Finley","Gabe","Garland","Gerald","Herschel","Hezekiah","Justus","Lindsey","Marcellus","Olaf","Olin","Pablo","Rolland","Turner","Verne","Volney","Williams","Almon","Alois","Alonza","Anson","Authur","Benton","Billie","Cornelious","Darius","Denis","Dillard","Doctor","Elvin","Emma","Eric","Evans","Gideon","Haywood","Hilliard","Hosea","Lincoln","Lonzo","Lucious","Lum","Malachi","Newt","Noel","Orie","Palmer","Pinkney","Shirley","Sumner","Terry","Urban","Uriah","Valentine","Waldo","Warner","Wong","Zeb","Abel","Alden","Archer","Avery","Carson","Cullen","Doc","Eben","Elige","Elizabeth","Elmore","Ernst","Finis","Freddie","Godfrey","Guss","Hamp","Hermann","Isadore","Isreal","Jones","June","Lacy","Lafe","Leland","Llewellyn","Ludwig","Manford","Maxwell","Minnie","Obie","Octave","Orrin","Ossie","Oswald","Park","Parley","Ramon","Rice","Stonewall","Theo","Tillman","Addie","Aron","Ashley","Bernhard","Bertie","Berton","Buster","Butler","Carleton","Carrie","Clara","Clarance","Clare","Crawford","Danial","Dayton","Dolphus","Elder","Ephriam","Fayette","Felipe","Fernando","Flem","Florence","Ford","Harlan","Hayes","Henery","Hoy","Huston","Ida","Ivory","Jonah","Justin","Lenard","Leopold","Lionel","Manley","Marquis","Marshal","Mart","Odie","Olen","Oral","Orley","Otha","Press","Price","Quincy","Randall","Rich","Richmond","Romeo","Russel","Rutherford","Shade","Shelby","Solon","Thurman","Tilden","Troy","Woodson","Worth","Aden","Alcide","Alf","Algie","Arlie","Bart","Bedford","Benito","Billy","Bird","Birt","Bruno","Burley","Chancy","Claus","Cliff","Clovis","Connie","Creed","Delos","Duke","Eber","Eligah","Elliot","Elton","Emmitt","Gene","Golden","Hal","Hardin","Harman","Hervey","Hollis","Ivey","Jennie","Len","Lindsay","Lonie","Lyle","Mac","Mal","Math","Miller","Orson","Osborne","Percival","Pleas","Ples","Rafael","Raoul","Roderick","Rose","Shelton","Sid","Theron","Tobias","Toney","Tyler","Vance","Vivian","Walton","Watt","Weaver","Wilton","Adolf","Albin","Albion","Allison","Alpha","Alpheus","Anastacio","Andre","Annie","Arlington","Armand","Asberry","Asbury","Asher","Augustin","Auther","Author","Ballard","Blas","Caesar","Candido","Cato","Clarke","Clemente","Colin","Commodore","Cora","Coy","Cruz","Curt","Damon","Davie","Delmar","Dexter","Dora","Doss","Drew","Edson","Elam","Elihu","Eliza","Elsie","Erie","Ernie","Ethel","Ferd","Friend","Garry","Gary","Grace","Gustaf","Hallie","Hampton","Harrie","Hattie","Hence","Hillard","Hollie","Holmes","Hope","Hyman","Ishmael","Jarrett","Jessee","Joeseph","Junious","Kirk","Levy","Mervin","Michel","Milford","Mitchel","Nellie","Noble","Obed","Oda","Orren","Ottis","Rafe","Redden","Reese","Rube","Ruby","Rupert","Salomon","Sammie","Sanders","Soloman","Stacy","Stanford","Stanton","Thad","Titus","Tracy","Vernie","Wendell","Wilhelm","Willian","Yee","Zeke","Ab","Abbott","Agustus","Albertus","Almer","Alphonso","Alvia","Artie","Arvid","Ashby","Augusta","Aurthur","Babe","Baldwin","Barnett","Bartholomew","Barton","Bernie","Blaine","Boston","Brad","Bradford","Bradley","Brooks","Buck","Budd","Ceylon","Chalmers","Chesley","Chin","Cleo","Crockett","Cyril","Daisy","Denver","Dow","Duff","Edie","Edith","Elick","Elie","Eliga","Eliseo","Elroy","Ely","Ennis","Enrique","Erasmus","Esau","Everette","Firman","Fleming","Flora","Gardner","Gee","Gorge","Gottlieb","Gregorio","Gregory","Gustavus","Halsey","Handy","Hardie","Harl","Hayden","Hays","Hermon","Hershel","Holly","Hosteen","Hoyt","Hudson","Huey","Humphrey","Hunt","Hyrum","Irven","Isam","Ivy","Jabez","Jewel","Jodie","Judd","Julious","Justice","Katherine","Kelly","Kit","Knute","Lavern","Lawyer","Layton","Leonidas","Lewie","Lillie","Linwood","Loran","Lorin","Mace","Malcom","Manly","Manson","Matthias","Mattie","Merida","Miner","Montgomery","Moroni","Murdock","Myrtle","Nate","Nathanial","Nimrod","Nora","Norval","Nova","Orion","Orla","Orrie","Payton","Philo","Phineas","Presley","Ransom","Reece","Rene","Roswell","Rowland","Sampson","Samual","Santos","Schuyler","Sheppard","Spurgeon","Starling","Sylvanus","Theadore","Theophile","Tilmon","Tommy","Unknown","Vann","Wes","Winston","Wood","Woodie","Worthy","Wright","York","Zachariah","John","William","James","George","Charles","Frank","Joseph","Henry","Thomas","Edward","Robert","Harry","Walter","Arthur","Fred","Albert","Samuel","David","Louis","Charlie","Clarence","Richard","Joe","Andrew","Ernest","Will","Jesse","Oscar","Daniel","Willie","Benjamin","Sam","Alfred","Roy","Lewis","Frederick","Peter","Elmer","Jacob","Herbert","Carl","Howard","Tom","Lee","Ralph","Martin","Jim","Earl","Eugene","Bert","Edgar","Herman","Claude","Michael","Paul","Ben","Ira","Harvey","Chester","Edwin","Ed","Charley","Francis","Isaac","Luther","Lawrence","Oliver","Clyde","Otto","Hugh","Alexander","Leonard","Jack","Raymond","Patrick","Guy","Homer","Floyd","Theodore","Allen","August","Marion","Philip","Warren","Horace","Dan","Ray","Garfield","Stephen","Emil","Jessie","Milton","Willis","Calvin","Dave","Bernard","Julius","Leroy","Sidney","Anthony","Archie","Perry","Leo","Leon","Rufus","Harold","Franklin","Adam","Alex","Alonzo","Everett","Clifford","Victor","Eddie","Alvin","Levi","Amos","Roscoe","Wesley","Dennis","Eli","Jerry","Jay","Hiram","Norman","Percy","Aaron","Gus","Mark","Willard","Moses","Earnest","Gilbert","Jake","Leslie","Nathan","Adolph","Nelson","Otis","Irvin","Wallace","Clinton","Lester","Lloyd","Morris","Abraham","Jess","Elbert","Phillip","Jasper","Ross","Noah","Wilbur","Claud","Cornelius","Mack","Matthew","Lonnie","Jose","Melvin","Stanley","Sylvester","Wiley","Simon","Reuben","Silas","Wilson","Curtis","Felix","Maurice","Alva","Elijah","Christopher","Owen","Austin","Clark","Max","Asa","Emmett","Fredrick","Russell","Virgil","Winfield","Mose","Timothy","Rudolph","Edmund","Harley","Harrison","Jeff","Orville","Irving","Andy","Ellis","Lemuel","Monroe","Anton","Joel","Manuel","Marvin","Pete","Vernon","Marshall","Nicholas","Ike","Mathew","Ora","Christian","Emery","Newton","Chris","Clayton","Pearl","Wade","Augustus","Columbus","Scott","Bob","Solomon","Emanuel","Nathaniel","Riley","Sherman","Glenn","Johnnie","Juan","Marcus","Ollie","Enoch","Ezra","Mike","Steve","Ambrose","Arch","Dock","Hubert","Bill","Burton","Edmond","Emory","Luke","Ole","Elias","Anderson","Barney","Byron","Cyrus","Edd","Joshua","Major","Miles","Chas","Clifton","Gustave","Nick","Taylor","Bud","Jerome","Lucius","Burt","Ward","Abe","Hugo","Julian","Millard","Preston","Tony","Cecil","Seth","Bruce","Fletcher","Jeremiah","Grant","Green","Neal","Bennie","Conrad","Dee","Ervin","Gordon","Grover","Isaiah","Lorenzo","Porter","Van","Glen","Jefferson","Louie","Abner","Abram","Dudley","Lucian","Roland","Vincent","Wayne","Arnold","Elisha","Elwood","Karl","Kenneth","Mary","Matt","Myron","Pink","Roger","Wilbert","Forrest","Irwin","Jackson","Laurence","Madison","Sanford","Archibald","Delbert","Donald","Lon","Stewart","Antonio","Chauncey","Don","Noble","Otho","Spencer","Avery","Dallas","Freeman","Jonas","Lige","Napoleon","Walker","Zack","Boyd","Clay","Dewitt","Emmet","Evan","General","Isiah","Josiah","Omer","Perley","Ferdinand","Hans","Israel","Judson","Morgan","Waldo","Berry","Carroll","Clement","Elliott","Ezekiel","Foster","Gust","Jason","Josh","Junius","Loren","Wilfred","Adolphus","Allie","Benjiman","Christ","Dwight","Earle","Francisco","Giles","Granville","Jonathan","Lafayette","Leander","Lyman","Lynn","Ruben","Dick","Elvin","Emerson","Emile","Isom","Jimmie","King","Mitchell","Orrin","Pat","Royal","Sim","Truman","Washington","Al","Carlos","Lem","Milo","Oren","Orlando","Allan","Arther","Caleb","Cicero","Clem","Clint","Forest","Gustav","Harmon","Ivan","Jordan","Ned","Nels","Phil","Randolph","Smith","Tomas","Turner","Ulysses","Vern","Wilford","Addison","Alford","Art","Benjamine","Dean","Enos","Erwin","Gabriel","Issac","Lucious","Malcolm","Merton","Micheal","Prince","Simeon","Anna","Carlton","Coleman","Douglas","Finis","Hardy","Hosea","Jules","Rolla","Tobe","Wash","Almon","Aubrey","Bertram","Casper","Ellsworth","Ephraim","Fay","Hamilton","Harris","Henery","Lou","Mat","Rollin","Sol","Steven","Verne","West","Wm","Adelbert","Alma","Aron","Axel","Bennett","Brown","Buck","Colonel","Elton","Elza","Gerald","Ivy","Johnie","Judge","Lenard","Minor","Morton","Murray","Nat","Newell","Norris","Pedro","Rollie","Sandy","Wilber","Wilburn","Wyatt","Davis","Dell","Doc","Fate","Frederic","Harlan","Harve","Henderson","Johnny","Logan","Mason","Merle","Merritt","Noel","Valentine","Wellington","Abel","Adrian","Alphonse","Carter","Cary","Cleveland","Crawford","Curt","Duncan","Early","Ernst","Frances","Gene","Hal","Hamp","Hezekiah","Lawson","Luis","Mathias","Olin","Parker","Pleasant","Reginald","Rich","Seymour","Solon","Stuart","Thaddeus","Tim","Winfred","Alton","Asbury","Bart","Benton","Beverly","Birt","Burl","Chin","Elihu","Erastus","Ford","Hampton","Houston","Johnson","Len","Lonzo","Loyd","Lucas","Lucien","Miller","Mortimer","Omar","Orval"];

const name_f = ["Mary","Anna","Emma","Elizabeth","Minnie","Margaret","Ida","Alice","Bertha","Sarah","Annie","Clara","Ella","Florence","Cora","Martha","Laura","Nellie","Grace","Carrie","Maude","Mabel","Bessie","Jennie","Gertrude","Julia","Hattie","Edith","Mattie","Rose","Catherine","Lillian","Ada","Lillie","Helen","Jessie","Louise","Ethel","Lula","Myrtle","Eva","Frances","Lena","Lucy","Edna","Maggie","Pearl","Daisy","Fannie","Josephine","Dora","Rosa","Katherine","Agnes","Marie","Nora","May","Mamie","Blanche","Stella","Ellen","Nancy","Effie","Sallie","Nettie","Della","Lizzie","Flora","Susie","Maud","Mae","Etta","Harriet","Sadie","Caroline","Katie","Lydia","Elsie","Kate","Susan","Mollie","Alma","Addie","Georgia","Eliza","Lulu","Nannie","Lottie","Amanda","Belle","Charlotte","Rebecca","Ruth","Viola","Olive","Amelia","Hannah","Jane","Virginia","Emily","Matilda","Irene","Kathryn","Esther","Willie","Henrietta","Ollie","Amy","Rachel","Sara","Estella","Theresa","Augusta","Ora","Pauline","Josie","Lola","Sophia","Leona","Anne","Mildred","Ann","Beulah","Callie","Lou","Delia","Eleanor","Barbara","Iva","Louisa","Maria","Mayme","Evelyn","Estelle","Nina","Betty","Marion","Bettie","Dorothy","Luella","Inez","Lela","Rosie","Allie","Millie","Janie","Cornelia","Victoria","Ruby","Winifred","Alta","Celia","Christine","Beatrice","Birdie","Harriett","Mable","Myra","Sophie","Tillie","Isabel","Sylvia","Carolyn","Isabelle","Leila","Sally","Ina","Essie","Bertie","Nell","Alberta","Katharine","Lora","Rena","Mina","Rhoda","Mathilda","Abbie","Eula","Dollie","Hettie","Eunice","Fanny","Ola","Lenora","Adelaide","Christina","Lelia","Nelle","Sue","Johanna","Lilly","Lucinda","Minerva","Lettie","Roxie","Cynthia","Helena","Hilda","Hulda","Bernice","Genevieve","Jean","Cordelia","Marian","Francis","Jeanette","Adeline","Gussie","Leah","Lois","Lura","Mittie","Hallie","Isabella","Olga","Phoebe","Teresa","Hester","Lida","Lina","Winnie","Claudia","Marguerite","Vera","Cecelia","Bess","Emilie","John","Rosetta","Verna","Myrtie","Cecilia","Elva","Olivia","Ophelia","Georgie","Elnora","Violet","Adele","Lily","Linnie","Loretta","Madge","Polly","Virgie","Eugenia","Lucile","Lucille","Mabelle","Rosalie","Kittie","Meta","Angie","Dessie","Georgiana","Lila","Regina","Selma","Wilhelmina","Bridget","Lilla","Malinda","Vina","Freda","Gertie","Jeannette","Louella","Mandy","Roberta","Cassie","Corinne","Ivy","Melissa","Lyda","Naomi","Norma","Bell","Margie","Nona","Zella","Dovie","Elvira","Erma","Irma","Leota","William","Artie","Blanch","Charity","Lorena","Lucretia","Orpha","Alvina","Annette","Catharine","Elma","Geneva","Janet","Lee","Leora","Lona","Miriam","Zora","Linda","Octavia","Sudie","Zula","Adella","Alpha","Frieda","George","Joanna","Leonora","Priscilla","Tennie","Angeline","Docia","Ettie","Flossie","Hanna","Letha","Minta","Retta","Rosella","Adah","Berta","Elisabeth","Elise","Goldie","Leola","Margret","Adaline","Floy","Idella","Juanita","Lenna","Lucie","Missouri","Nola","Zoe","Eda","Isabell","James","Julie","Letitia","Madeline","Malissa","Mariah","Pattie","Vivian","Almeda","Aurelia","Claire","Dolly","Hazel","Jannie","Kathleen","Kathrine","Lavinia","Marietta","Melvina","Ona","Pinkie","Samantha","Susanna","Chloe","Donnie","Elsa","Gladys","Matie","Pearle","Vesta","Vinnie","Antoinette","Clementine","Edythe","Harriette","Libbie","Lilian","Lue","Lutie","Magdalena","Meda","Rita","Tena","Zelma","Adelia","Annetta","Antonia","Dona","Elizebeth","Georgianna","Gracie","Iona","Lessie","Leta","Liza","Mertie","Molly","Neva","Oma","Alida","Alva","Cecile","Cleo","Donna","Ellie","Ernestine","Evie","Frankie","Helene","Minna","Myrta","Prudence","Queen","Rilla","Savannah","Tessie","Tina","Agatha","America","Anita","Arminta","Dorothea","Ira","Luvenia","Marjorie","Maybelle","Mellie","Nan","Pearlie","Sidney","Velma","Clare","Constance","Dixie","Ila","Iola","Jimmie","Louvenia","Lucia","Ludie","Luna","Metta","Patsy","Phebe","Sophronia","Adda","Avis","Betsy","Bonnie","Cecil","Cordie","Emmaline","Ethelyn","Hortense","June","Louie","Lovie","Marcella","Melinda","Mona","Odessa","Veronica","Aimee","Annabel","Ava","Bella","Carolina","Cathrine","Christena","Clyde","Dena","Dolores","Eleanore","Elmira","Fay","Frank","Jenny","Kizzie","Lonnie","Loula","Magdalene","Mettie","Mintie","Peggy","Reba","Serena","Vida","Zada","Abigail","Celestine","Celina","Claudie","Clemmie","Connie","Daisie","Deborah","Dessa","Easter","Eddie","Emelia","Emmie","Imogene","India","Jeanne","Joan","Lenore","Liddie","Lotta","Mame","Nevada","Rachael","Sina","Willa","Aline","Beryl","Charles","Daisey","Dorcas","Edmonia","Effa","Eldora","Eloise","Emmer","Era","Gena","Henry","Iris","Izora","Lennie","Lissie","Mallie","Malvina","Mathilde","Mazie","Queenie","Robert","Rosina","Salome","Theodora","Therese","Vena","Wanda","Wilda","Altha","Anastasia","Besse","Bird","Birtie","Clarissa","Claude","Delilah","Diana","Emelie","Erna","Fern","Florida","Frona","Hilma","Joseph","Juliet","Leonie","Lugenia","Mammie","Manda","Manerva","Manie","Nella","Paulina","Philomena","Rae","Selina","Sena","Theodosia","Tommie","Una","Vernie","Adela","Althea","Amalia","Amber","Angelina","Annabelle","Anner","Arie","Clarice","Corda","Corrie","Dell","Dellar","Donie","Doris","Elda","Elinor","Emeline","Emilia","Esta","Estell","Etha","Fred","Hope","Indiana","Ione","Jettie","Johnnie","Josiephine","Kitty","Lavina","Leda","Letta","Mahala","Marcia","Margarette","Maudie","Maye","Norah","Oda","Patty","Paula","Permelia","Rosalia","Roxanna","Sula","Vada","Winnifred","Adline","Almira","Alvena","Arizona","Becky","Bennie","Bernadette","Camille","Cordia","Corine","Dicie","Dove","Drusilla","Elena","Elenora","Elmina","Ethyl","Evalyn","Evelina","Faye","Huldah","Idell","Inga","Irena","Jewell","Kattie","Lavenia","Leslie","Lovina","Lulie","Magnolia","Margeret","Margery","Media","Millicent","Nena","Ocie","Orilla","Osie","Pansy","Ray","Rosia","Rowena","Shirley","Tabitha","Thomas","Verdie","Walter","Zetta","Zoa","Zona","Albertina","Albina","Alyce","Amie","Angela","Annis","Carol","Carra","Clarence","Clarinda","Delphia","Dillie","Doshie","Drucilla","Etna","Eugenie","Eulalia","Eve","Felicia","Florance","Fronie","Geraldine","Gina","Glenna","Grayce","Hedwig","Jessica","Jossie","Katheryn","Katy","Lea","Leanna","Leitha","Leone","Lidie","Loma","Lular","Magdalen","Maymie","Minervia","Muriel","Neppie","Olie","Onie","Osa","Otelia","Paralee","Patience","Rella","Rillie","Rosanna","Theo","Tilda","Tishie","Tressa","Viva","Yetta","Zena","Zola","Abby","Aileen","Alba","Alda","Alla","Alverta","Ara","Ardelia","Ardella","Arrie","Arvilla","Augustine","Aurora","Bama","Bena","Byrd","Calla","Camilla","Carey","Carlotta","Celestia","Cherry","Cinda","Classie","Claudine","Clemie","Clifford","Clyda","Creola","Debbie","Dee","Dinah","Doshia","Ednah","Edyth","Eleanora","Electa","Eola","Erie","Eudora","Euphemia","Evalena","Evaline","Faith","Fidelia","Freddie","Golda","Harry","Helma","Hermine","Hessie","Ivah","Janette","Jennette","Joella","Kathryne","Lacy","Lanie","Lauretta","Leana","Leatha","Leo","Liller","Lillis","Louetta","Madie","Mai","Martina","Maryann","Melva","Mena","Mercedes","Merle","Mima","Minda","Monica","Nealie","Netta","Nolia","Nonie","Odelia","Ottilie","Phyllis","Robbie","Sabina","Sada","Sammie","Suzanne","Sybilla","Thea","Tressie","Vallie","Venie","Viney","Wilhelmine","Winona","Zelda","Zilpha","Adelle","Adina","Adrienne","Albertine","Alys","Ana","Araminta","Arthur","Birtha","Bulah","Caddie","Celie","Charlotta","Clair","Concepcion","Cordella","Corrine","Delila","Delphine","Dosha","Edgar","Elaine","Elisa","Ellar","Elmire","Elvina","Ena","Estie","Etter","Fronnie","Genie","Georgina","Glenn","Gracia","Guadalupe","Gwendolyn","Hassie","Honora","Icy","Isa","Isadora","Jesse","Jewel","Joe","Johannah","Juana","Judith","Judy","Junie","Lavonia","Lella","Lemma","Letty","Linna","Littie","Lollie","Lorene","Louis","Love","Lovisa","Lucina","Lynn","Madora","Mahalia","Manervia","Manuela","Margarett","Margaretta","Margarita","Marilla","Mignon","Mozella","Natalie","Nelia","Nolie","Omie","Opal","Ossie","Ottie","Ottilia","Parthenia","Penelope","Pinkey","Pollie","Rennie","Reta","Roena","Rosalee","Roseanna","Ruthie","Sabra","Sannie","Selena","Sibyl","Tella","Tempie","Tennessee","Teressa","Texas","Theda","Thelma","Thursa","Ula","Vannie","Verona","Vertie","Wilma","Mary","Anna","Emma","Elizabeth","Margaret","Minnie","Ida","Annie","Bertha","Alice","Clara","Sarah","Ella","Nellie","Grace","Florence","Martha","Cora","Laura","Carrie","Maude","Bessie","Mabel","Gertrude","Ethel","Jennie","Edith","Hattie","Mattie","Julia","Rose","Lillian","Lillie","Eva","Jessie","Lula","Myrtle","Pearl","Edna","Catherine","Ada","Louise","Helen","Lucy","Frances","Dora","Fannie","Josephine","Daisy","Lena","Maggie","Katherine","Rosa","Marie","Nora","Effie","Blanche","May","Nancy","Della","Agnes","Nettie","Sallie","Stella","Ellen","Mamie","Lizzie","Susie","Sadie","Elsie","Maud","Flora","Caroline","Etta","Mae","Lulu","Lydia","Alma","Susan","Lottie","Addie","Mollie","Katie","Ruth","Harriet","Kate","Amanda","Nannie","Georgia","Emily","Eliza","Viola","Amelia","Willie","Charlotte","Rebecca","Belle","Kathryn","Jane","Olive","Virginia","Irene","Hannah","Ora","Esther","Matilda","Henrietta","Theresa","Ollie","Pauline","Estella","Beulah","Augusta","Rachel","Mildred","Josie","Sara","Amy","Louisa","Luella","Leona","Anne","Ann","Barbara","Lola","Estelle","Lela","Millie","Nina","Iva","Sophia","Maria","Ruby","Victoria","Evelyn","Mayme","Alta","Lou","Janie","Betty","Delia","Eleanor","Marion","Dorothy","Ina","Celia","Callie","Bettie","Allie","Inez","Dollie","Ola","Lucinda","Mable","Rena","Beatrice","Harriett","Rosie","Birdie","Eula","Rhoda","Winnie","Christina","Isabelle","Tillie","Abbie","Winifred","Essie","Lora","Sally","Sophie","Eunice","Leila","Isabel","Nell","Lelia","Myra","Nelle","Roxie","Mathilda","Bertie","Katharine","Lenora","Lettie","Christine","Sue","Sylvia","Cornelia","Linnie","Alberta","Hettie","Adelaide","Mina","Helena","Carolyn","Adeline","Genevieve","Johanna","Loretta","Lida","Fanny","Hester","Lilly","Naomi","Lois","Minerva","Mittie","Bess","Claudia","Leah","Lucretia","Marguerite","Cecelia","Elva","Olivia","Gussie","Hazel","Isabella","Cordelia","Rosetta","Wilhelmina","Bernice","Hilda","Lucille","Polly","Vera","Cynthia","Elnora","Francis","Selma","Lily","Lura","Phoebe","Teresa","Angie","Hulda","Jean","Louella","Myrtie","Adele","Jeannette","Lyda","Virgie","Dessie","Lila","Violet","Elma","Madge","Regina","Roberta","Catharine","Eugenia","Gladys","Malinda","Mandy","Melissa","Cecilia","Goldie","Lee","Lina","Marian","Elvira","Emilie","Ivy","Linda","Nona","Zella","Hallie","Irma","Jeanette","Leola","Lucile","Geneva","Gertie","Bridget","Freda","Dolly","Molly","Georgie","Lilla","Margie","Nola","Dovie","Letha","Olga","George","Meta","Verna","William","Adah","Alvina","Antoinette","Bell","Janet","Mabelle","Mertie","Cassie","Erma","Flossie","Louie","Alpha","Blanch","Ellie","Johnnie","Lona","Lorena","Miriam","Ophelia","Priscilla","Sudie","Zula","Annette","John","Norma","Rosalie","Vina","Bonnie","Corinne","Elisabeth","Elsa","Frieda","Juanita","Melvina","Tennie","Bella","Cecile","Dona","Frankie","Gracie","James","Kittie","Leota","Maudie","Orpha","Savannah","Vinnie","Vivian","Anita","Claire","Cleo","Dena","Eda","Leonora","Leora","Liza","Almeda","Artie","Charity","Elise","Georgianna","Harriette","Isabell","Jimmie","Julie","Kitty","Margret","Nan","Pearlie","Zoe","Adelia","Angeline","Dorothea","Ernestine","Joanna","Lennie","Leta","Lue","Marietta","Ona","Pearle","Rilla","Susanna","Zora","Adda","Clare","Georgiana","Helene","Ila","Libbie","Magdalena","Phebe","Rita","Vesta","Edythe","Kathrine","Letitia","Nella","Octavia","Oma","Tena","Tina","Velma","Adaline","Ava","Cathrine","Emmie","Ettie","Evie","Fay","Iona","Lavina","Lessie","Luna","Matie","Charles","Clyde","Elmira","Floy","Hanna","Hilma","Isa","Mellie","Missouri","Pinkie","Reba","Retta","Zelma","Adella","Alida","Cecil","Eugenie","India","June","Katheryn","Lilian","Lotta","Lucia","Lutie","Malissa","Maybelle","Sidney","Sophronia","Tilda","Albina","Arvilla","Aurelia","Donna","Inga","Jenny","Lauretta","Marjorie","Neva","Odessa","Pattie","Queen","Veronica","Adell","Berta","Celeste","Chloe","Constance","Deborah","Docia","Donnie","Eloise","Hortense","Imogene","Iola","Lavinia","Loula","Madeline","Magdalene","Mame","Manda","Mazie","Mona","Opal","Una","Vida","Alva","Annabelle","Antonia","Betsy","Florida","Henry","Idella","Kathleen","Lenna","Ludie","Mahala","Malvina","Marcia","Mariah","Myrta","Norah","Paralee","Serena","Sina","Tressie","Vernie","Camille","Connie","Dell","Faye","Magnolia","Minta","Natalie","Patsy","Permelia","Rosella","Samantha","Tessie","Aimee","Alda","Aline","Altha","Amalia","America","Anastasia","Annetta","Audrey","Camilla","Carol","Celina","Christena","Cordie","Easter","Eddie","Ethelyn","Geraldine","Jeanne","Kattie","Leatha","Leslie","Lonie","Lovina","Mathilde","Melinda","Mettie","Muriel","Ocie","Ottilie","Philomena","Ray","Sena","Thomas","Walter","Winona","Zadie","Agatha","Almira","Arrie","Aura","Carolina","Daisie","Delilah","Dixie","Dolores","Doris","Elta","Emelia","Eve","Eveline","Fern","Glenna","Grayce","Huldah","Ione","Joe","Joseph","Judith","Lelah","Lenore","Leone","Lucie","Mammie","Marcella","Maye","Metta","Minna","Mintie","Monica","Nanie","Petra","Rella","Rosalia","Vada","Vallie","Willa","Wilma","Zola","Amie","Ana","Angela","Becky","Bennie","Claude","Corrie","Corrine","Delphine","Doshia","Elvie","Elvina","Era","Evelina","Frank","Fred","Frona","Genie","Glennie","Honora","Janette","Jannie","Juliet","Juliette","Kizzie","Lovie","Mallie","Mannie","Margaretta","Mercy","Miranda","Nana","Oda","Osa","Paula","Prudence","Robert","Selina","Sibyl","Zilpah","Zona","Abigail","Almedia","Althea","Angelina","Anner","Ara","Berdie","Beryl","Besse","Byrdie","Calla","Carlotta","Claribel","Clarice","Clemmie","Clifford","Coral","Dillie","Edwina","Elinor","Elizebeth","Emmer","Esta","Exie","Felicia","Ira","Iris","Jettie","Juana","Justine","Leanna","Leonie","Louvenia","Malissie","Manie","Margery","Maymie","Meda","Myrtice","Narcissus","Nonie","Onie","Pansy","Paulina","Rachael","Rosamond","Rosanna","Theo","Theresia","Tommie","Valeria","Vessie","Victorine","Wilhelmine","Winnifred","Zada","Abby","Adela","Alfreda","Alicia","Alla","Arabella","Ardella","Arminda","Arminta","Audie","Cammie","Carmen","Claudie","Cordia","Delila","Dessa","Diana","Dicie","Dottie","Dove","Drucilla","Edyth","Effa","Eleanora","Emilia","Etha","Ethyl","Etna","Eulalia","Flo","Fredericka","Gloria","Gusta","Hessie","Hope","Icie","Jessica","Lea","Letta","Liddie","Lillia","Lota","Lulie","Madie","Manuela","Margarita","Nathalie","Nevada","Nita","Ota","Parthenia","Queenie","Rae","Ramona","Rosina","Selena","Tempie","Texie","Will","Zetta","Zillah","Aida","Albertine","Allene","Annabel","Arizona","Arra","Aurora","Belva","Biddie","Bird","Bula","Carry","Clementine","Corine","Courtney","Crete","Daisey","Dee","Dicy","Donie","Dorcas","Dossie","Elda","Eldora","Elenora","Ellar","Emelie","Emeline","Emmaline","Ester","Euphemia","Evaline","Evangeline","Flavia","Fleta","Florance","Fronia","Gillie","Guadalupe","Hassie","Icy","Ivah","Jewel","Jinnie","Joan","Jonnie","Karen","Katharina","Kathryne","Lella","Leo","Luvenia","Mai","Margarett","Mell","Merle","Mirtie","Mora"]

const surnames = ["Smith","Johnson","Williams","Brown","Jones","Miller","Davis","Garcia","Rodriguez","Wilson","Martinez","Anderson","Taylor","Thomas","Hernandez","Moore","Martin","Jackson","Thompson","White","Lopez","Lee","Gonzalez","Harris","Clark","Lewis","Robinson","Walker","Perez","Hall","Young","Allen","Sanchez","Wright","King","Scott","Green","Baker","Adams","Nelson","Hill","Ramirez","Campbell","Mitchell","Roberts","Carter","Phillips","Evans","Turner","Torres","Parker","Collins","Edwards","Stewart","Flores","Morris","Nguyen","Murphy","Rivera","Cook","Rogers","Morgan","Peterson","Cooper","Reed","Bailey","Bell","Gomez","Kelly","Howard","Ward","Cox","Diaz","Richardson","Wood","Watson","Brooks","Bennett","Gray","James","Reyes","Cruz","Hughes","Price","Myers","Long","Foster","Sanders","Ross","Morales","Powell","Sullivan","Russell","Ortiz","Jenkins","Gutierrez","Perry","Butler","Barnes","Fisher","Henderson","Coleman","Simmons","Patterson","Jordan","Reynolds","Hamilton","Graham","Kim","Gonzales","Alexander","Ramos","Wallace","Griffin","West","Cole","Hayes","Chavez","Gibson","Bryant","Ellis","Stevens","Murray","Ford","Marshall","Owens","Mcdonald","Harrison","Ruiz","Kennedy","Wells","Alvarez","Woods","Mendoza","Castillo","Olson","Webb","Washington","Tucker","Freeman","Burns","Henry","Vasquez","Snyder","Simpson","Crawford","Jimenez","Porter","Mason","Shaw","Gordon","Wagner","Hunter","Romero","Hicks","Dixon","Hunt","Palmer","Robertson","Black","Holmes","Stone","Meyer","Boyd","Mills","Warren","Fox","Rose","Rice","Moreno","Schmidt","Patel","Ferguson","Nichols","Herrera","Medina","Ryan","Fernandez","Weaver","Daniels","Stephens","Gardner","Payne","Kelley","Dunn","Pierce","Arnold","Tran","Spencer","Peters","Hawkins","Grant","Hansen","Castro","Hoffman","Hart","Elliott","Cunningham","Knight","Bradley","Carroll","Hudson","Duncan","Armstrong","Berry","Andrews","Johnston","Ray","Lane","Riley","Carpenter","Perkins","Aguilar","Silva","Richards","Willis","Matthews","Chapman","Lawrence","Garza","Vargas","Watkins","Wheeler","Larson","Carlson","Harper","George","Greene","Burke","Guzman","Morrison","Munoz","Jacobs","Obrien","Lawson","Franklin","Lynch","Bishop","Carr","Salazar","Austin","Mendez","Gilbert","Jensen","Williamson","Montgomery","Harvey","Oliver","Howell","Dean","Hanson","Weber","Garrett","Sims","Burton","Fuller","Soto","Mccoy","Welch","Chen","Schultz","Walters","Reid","Fields","Walsh","Little","Fowler","Bowman","Davidson","May","Day","Schneider","Newman","Brewer","Lucas","Holland","Wong","Banks","Santos","Curtis","Pearson","Delgado","Valdez","Pena","Rios","Douglas","Sandoval","Barrett","Hopkins","Keller","Guerrero","Stanley","Bates","Alvarado","Beck","Ortega","Wade","Estrada","Contreras","Barnett","Caldwell","Santiago","Lambert","Powers","Chambers","Nunez","Craig","Leonard","Lowe","Rhodes","Byrd","Gregory","Shelton","Frazier","Becker","Maldonado","Fleming","Vega","Sutton","Cohen","Jennings","Parks","Mcdaniel","Watts","Barker","Norris","Vaughn","Vazquez","Holt","Schwartz","Steele","Benson","Neal","Dominguez","Horton","Terry","Wolfe","Hale","Lyons","Graves","Haynes","Miles","Park","Warner","Padilla","Bush","Thornton","Mccarthy","Mann","Zimmerman","Erickson","Fletcher","Mckinney","Page","Dawson","Joseph","Marquez","Reeves","Klein","Espinoza","Baldwin","Moran","Love","Robbins","Higgins","Ball","Cortez","Le","Griffith","Bowen","Sharp","Cummings","Ramsey","Hardy","Swanson","Barber","Acosta","Luna","Chandler","Blair","Daniel","Cross","Simon","Dennis","Oconnor","Quinn","Gross","Navarro","Moss","Fitzgerald","Doyle","Mclaughlin","Rojas","Rodgers","Stevenson","Singh","Yang","Figueroa","Harmon","Newton","Paul","Manning","Garner","Mcgee","Reese","Francis","Burgess","Adkins","Goodman","Curry","Brady","Christensen","Potter","Walton","Goodwin","Mullins","Molina","Webster","Fischer","Campos","Avila","Sherman","Todd","Chang","Blake","Malone","Wolf","Hodges","Juarez","Gill","Farmer","Hines","Gallagher","Duran","Hubbard","Cannon","Miranda","Wang","Saunders","Tate","Mack","Hammond","Carrillo","Townsend","Wise","Ingram","Barton","Mejia","Ayala","Schroeder","Hampton","Rowe","Parsons","Frank","Waters","Strickland","Osborne","Maxwell","Chan","Deleon","Norman","Harrington","Casey","Patton","Logan","Bowers","Mueller","Glover","Floyd","Hartman","Buchanan","Cobb","French","Kramer","Mccormick","Clarke","Tyler","Gibbs","Moody","Conner","Sparks","Mcguire","Leon","Bauer","Norton","Pope","Flynn","Hogan","Robles","Salinas","Yates","Lindsey","Lloyd","Marsh","Mcbride","Owen","Solis","Pham","Lang","Pratt","Lara","Brock","Ballard","Trujillo","Shaffer","Drake","Roman","Aguirre","Morton","Stokes","Lamb","Pacheco","Patrick","Cochran","Shepherd","Cain","Burnett","Hess","Li","Cervantes","Olsen","Briggs","Ochoa","Cabrera","Velasquez","Montoya","Roth","Meyers","Cardenas","Fuentes","Weiss","Hoover","Wilkins","Nicholson","Underwood","Short","Carson","Morrow","Colon","Holloway","Summers","Bryan","Petersen","Mckenzie","Serrano","Wilcox","Carey","Clayton","Poole","Calderon","Gallegos","Greer","Rivas","Guerra","Decker","Collier","Wall","Whitaker","Bass","Flowers","Davenport","Conley","Houston","Huff","Copeland","Hood","Monroe","Massey","Roberson","Combs","Franco","Larsen","Pittman","Randall","Skinner","Wilkinson","Kirby","Cameron","Bridges","Anthony","Richard","Kirk","Bruce","Singleton","Mathis","Bradford","Boone","Abbott","Charles","Allison","Sweeney","Atkinson","Horn","Jefferson","Rosales","York","Christian","Phelps","Farrell","Castaneda","Nash","Dickerson","Bond","Wyatt","Foley","Chase","Gates","Vincent","Mathews","Hodge","Garrison","Trevino","Villarreal","Heath","Dalton","Valencia","Callahan","Hensley","Atkins","Huffman","Roy","Boyer","Shields","Lin","Hancock","Grimes","Glenn","Cline","Delacruz","Camacho","Dillon","Parrish","Oneill","Melton","Booth","Kane","Berg","Harrell","Pitts","Savage","Wiggins","Brennan","Salas","Marks","Russo","Sawyer","Baxter","Golden","Hutchinson","Liu","Walter","Mcdowell","Wiley","Rich","Humphrey","Johns","Koch","Suarez","Hobbs","Beard","Gilmore","Ibarra","Keith","Macias","Khan","Andrade","Ware","Stephenson","Henson","Wilkerson","Dyer","Mcclure","Blackwell","Mercado","Tanner","Eaton","Clay","Barron","Beasley","Oneal","Preston","Small","Wu","Zamora","Macdonald","Vance","Snow","Mcclain","Stafford","Orozco","Barry","English","Shannon","Kline","Jacobson","Woodard","Huang","Kemp","Mosley","Prince","Merritt","Hurst","Villanueva","Roach","Nolan","Lam","Yoder","Mccullough","Lester","Santana","Valenzuela","Winters","Barrera","Leach","Orr","Berger","Mckee","Strong","Conway","Stein","Whitehead","Bullock","Escobar","Knox","Meadows","Solomon","Velez","Odonnell","Kerr","Stout","Blankenship","Browning","Kent","Lozano","Bartlett","Pruitt","Buck","Barr","Gaines","Durham","Gentry","Mcintyre","Sloan","Melendez","Rocha","Herman","Sexton","Moon","Hendricks","Rangel","Stark","Lowery","Hardin","Hull","Sellers","Ellison","Calhoun","Gillespie","Mora","Knapp","Mccall","Morse","Dorsey","Weeks","Nielsen","Livingston","Leblanc","Mclean","Bradshaw","Glass","Middleton","Buckley","Schaefer","Frost","Howe","House","Mcintosh","Ho","Pennington","Reilly","Hebert","Mcfarland","Hickman","Noble","Spears","Conrad","Arias","Galvan","Velazquez","Huynh","Frederick","Randolph","Cantu","Fitzpatrick","Mahoney","Peck","Villa","Michael","Donovan","Mcconnell","Walls","Boyle","Mayer","Zuniga","Giles","Pineda","Pace","Hurley","Mays","Mcmillan","Crosby","Ayers","Case","Bentley","Shepard","Everett","Pugh","David","Mcmahon","Dunlap","Bender","Hahn","Harding","Acevedo","Raymond","Blackburn","Duffy","Landry","Dougherty","Bautista","Shah","Potts","Arroyo","Valentine","Meza","Gould","Vaughan","Fry","Rush","Avery","Herring","Dodson","Clements","Sampson","Tapia","Bean","Lynn","Crane","Farley","Cisneros","Benton","Ashley","Mckay","Finley","Best","Blevins","Friedman","Moses","Sosa","Blanchard","Huber","Frye","Krueger","Bernard","Rosario","Rubio","Mullen","Benjamin","Haley","Chung","Moyer","Choi","Horne","Yu","Woodward","Ali","Nixon","Hayden","Rivers","Estes","Mccarty","Richmond","Stuart","Maynard","Brandt","Oconnell","Hanna","Sanford","Sheppard","Church","Burch","Levy","Rasmussen","Coffey","Ponce","Faulkner","Donaldson","Schmitt","Novak","Costa","Montes","Booker","Cordova","Waller","Arellano","Maddox","Mata","Bonilla","Stanton","Compton","Kaufman","Dudley","Mcpherson","Beltran","Dickson","Mccann","Villegas","Proctor","Hester","Cantrell","Daugherty","Cherry","Bray","Davila","Rowland","Levine","Madden","Spence","Good","Irwin","Werner","Krause","Petty","Whitney","Baird","Hooper","Pollard","Zavala","Jarvis","Holden","Haas","Hendrix","Mcgrath","Bird","Lucero","Terrell","Riggs","Joyce","Mercer","Rollins","Galloway","Duke","Odom","Andersen","Downs","Hatfield","Benitez","Archer","Huerta","Travis","Mcneil","Hinton","Zhang","Hays","Mayo","Fritz","Branch","Mooney","Ewing","Ritter","Esparza","Frey","Braun","Gay","Riddle","Haney","Kaiser","Holder","Chaney","Mcknight","Gamble","Vang","Cooley","Carney","Cowan","Forbes","Ferrell","Davies","Barajas","Shea","Osborn","Bright","Cuevas","Bolton","Murillo","Lutz","Duarte","Kidd","Key","Cooke","Goff","Dejesus","Marin","Dotson","Bonner","Cotton","Merrill","Lindsay","Lancaster","Mcgowan","Felix","Salgado","Slater","Carver","Guthrie","Holman","Fulton","Snider","Sears","Witt","Newell","Byers","Lehman","Gorman","Costello","Donahue","Delaney","Albert","Workman","Rosas","Springer","Justice","Kinney","Odell","Lake","Donnelly","Law","Dailey","Guevara","Shoemaker","Barlow","Marino","Winter","Craft","Katz","Pickett","Espinosa","Daly","Maloney","Goldstein","Crowley","Vogel","Kuhn","Pearce","Hartley","Cleveland","Palacios","Mcfadden","Britt","Wooten","Cortes","Dillard","Childers","Alford","Dodd","Emerson","Wilder","Lange","Goldberg","Quintero","Beach","Enriquez","Quintana","Helms","Mackey","Finch","Cramer","Minor","Flanagan","Franks","Corona","Kendall","Mccabe","Hendrickson","Moser","Mcdermott","Camp","Mcleod","Bernal","Kaplan","Medrano","Lugo","Tracy","Bacon","Crowe","Richter","Welsh","Holley","Ratliff","Mayfield","Talley","Haines","Dale","Gibbons","Hickey","Byrne","Kirkland","Farris","Correa","Tillman","Sweet","Kessler","England","Hewitt","Blanco","Connolly","Pate","Elder","Bruno","Holcomb","Hyde","Mcallister","Cash","Christopher","Whitfield","Meeks","Hatcher","Fink","Sutherland","Noel","Ritchie","Rosa","Leal","Joyner","Starr","Morin","Delarosa","Connor","Hilton","Alston","Gilliam","Wynn","Wills","Jaramillo","Oneil","Nieves","Britton","Rankin","Belcher","Guy","Chamberlain","Tyson","Puckett","Downing","Sharpe","Boggs","Truong","Pierson","Godfrey","Mobley","John","Kern","Dye","Hollis","Bravo","Magana","Rutherford","Ng","Tuttle","Lim","Romano","Arthur","Trejo","Knowles","Lyon","Shirley","Quinones","Childs","Dolan","Head","Reyna","Saenz","Hastings","Kenney","Cano","Foreman","Denton","Villalobos","Pryor","Sargent","Doherty","Hopper","Phan","Womack","Lockhart","Ventura","Dwyer","Muller","Galindo","Grace","Sorensen","Courtney","Parra","Rodrigues","Nicholas","Ahmed","Mcginnis","Langley","Madison","Locke","Jamison","Nava","Gustafson","Sykes","Dempsey","Hamm","Rodriquez","Mcgill","Xiong","Esquivel","Simms","Kendrick","Boyce","Vigil","Downey","Mckenna","Sierra","Webber","Kirkpatrick","Dickinson","Couch","Burks","Sheehan","Slaughter","Pike","Whitley","Magee","Cheng","Sinclair","Cassidy","Rutledge","Burris","Bowling","Crabtree","Mcnamara","Avalos","Vu","Herron","Broussard","Abraham","Garland","Corbett","Corbin","Stinson","Chin","Burt","Hutchins","Woodruff","Lau","Brandon","Singer","Hatch","Rossi","Shafer","Ott","Goss","Gregg","Dewitt","Tang","Polk","Worley","Covington","Saldana","Heller","Emery","Swartz","Cho","Mccray","Elmore","Rosenberg","Simons","Clemons","Beatty","Harden","Herbert","Bland","Rucker","Manley","Ziegler","Grady","Lott","Rouse","Gleason","Mcclellan","Abrams","Vo","Albright","Meier","Dunbar","Ackerman","Padgett","Mayes","Tipton","Coffman","Peralta","Shapiro","Roe","Weston","Plummer","Helton","Stern","Fraser","Stover","Fish","Schumacher","Baca","Curran","Vinson","Vera","Clifton","Ervin","Eldridge","Lowry","Childress","Becerra","Gore","Seymour","Chu","Field","Akers","Carrasco","Bingham","Sterling","Greenwood","Leslie","Groves","Manuel","Swain","Edmonds","Muniz","Thomson","Crouch","Walden","Smart","Tomlinson","Alfaro","Quick","Goldman","Mcelroy","Yarbrough","Funk","Hong","Portillo","Lund","Ngo","Elkins","Stroud","Meredith","Battle","Mccauley","Zapata","Bloom","Gee","Givens","Cardona","Schafer","Robison","Gunter","Griggs","Tovar","Teague","Swift","Bowden","Schulz","Blanton","Buckner","Whalen","Pritchard","Pierre","Kang","Butts","Metcalf","Kurtz","Sanderson","Tompkins","Inman","Crowder","Dickey","Hutchison","Conklin","Hoskins","Holbrook","Horner","Neely","Tatum","Hollingsworth","Draper","Clement","Lord","Reece","Feldman","Kay","Hagen","Crews","Bowles","Post","Jewell","Daley","Cordero","Mckinley","Velasco","Masters","Driscoll","Burrell","Valle","Crow","Devine","Larkin","Chappell","Pollock","Kimball","Ly","Schmitz","Lu","Rubin","Self","Barrios","Pereira","Phipps","Mcmanus","Nance","Steiner","Poe","Crockett","Jeffries","Amos","Nix","Newsome","Dooley","Payton","Rosen","Swenson","Connelly","Tolbert","Segura","Esposito","Coker","Biggs","Hinkle","Thurman","Drew","Ivey","Bullard","Baez","Neff","Maher","Stratton","Egan","Dubois","Gallardo","Blue","Rainey","Yeager","Saucedo","Ferreira","Sprague","Lacy","Hurtado","Heard","Connell","Stahl","Aldridge","Amaya","Forrest","Erwin","Gunn","Swan","Butcher","Rosado","Godwin","Hand","Gabriel","Otto","Whaley","Ludwig","Clifford","Grove","Beaver","Silver","Dang","Hammer","Dick","Boswell","Mead","Colvin","Oleary","Milligan","Goins","Ames","Dodge","Kaur","Escobedo","Arredondo","Geiger","Winkler","Dunham","Temple","Babcock","Billings","Grimm","Lilly","Wesley","Mcghee","Painter","Siegel","Bower","Purcell","Block","Aguilera","Norwood","Sheridan","Cartwright","Coates","Davison","Regan","Ramey","Koenig","Kraft","Bunch","Engel","Tan","Winn","Steward","Link","Vickers","Bragg","Piper","Huggins","Michel","Healy","Jacob","Mcdonough","Wolff","Colbert","Zepeda","Hoang","Dugan","Kilgore","Meade","Guillen","Do","Hinojosa","Goode","Arrington","Gary","Snell","Willard","Renteria","Chacon","Gallo","Hankins","Montano","Browne","Peacock","Ohara","Cornell","Sherwood","Castellanos","Thorpe","Stiles","Sadler","Latham","Redmond","Greenberg","Cote","Waddell","Dukes","Diamond","Bui","Madrid","Alonso","Sheets","Irvin","Hurt","Ferris","Sewell","Carlton","Aragon","Blackmon","Hadley","Hoyt","Mcgraw","Pagan","Land","Tidwell","Lovell","Miner","Doss","Dahl","Delatorre","Stanford","Kauffman","Vela","Gagnon","Winston","Gomes","Thacker","Coronado","Ash","Jarrett","Hager","Samuels","Metzger","Raines","Spivey","Maurer","Han","Voss","Henley","Caballero","Caruso","Coulter","North","Finn","Cahill","Lanier","Souza","Mcwilliams","Deal","Schaffer","Urban","Houser","Cummins","Romo","Crocker","Bassett","Kruse","Bolden","Ybarra","Metz","Root","Mcmullen","Crump","Hagan","Guidry","Brantley","Kearney","Beal","Toth","Jorgensen","Timmons","Milton","Tripp","Hurd","Sapp","Whitman","Messer","Burgos","Major","Westbrook","Castle","Serna","Carlisle","Varela","Cullen","Wilhelm","Bergeron","Burger","Posey","Barnhart","Hackett","Madrigal","Eubanks","Sizemore","Hilliard","Hargrove","Boucher"]

let started = false;
let nr = 0;
let currentTarget;
const motifsSet = [];

getRandomMotif();

var textarea = document.createElement('textarea');
document.body.appendChild(textarea);
textarea.onkeyup = (e) => {
  if (currentTarget) {
    if (currentTarget.getText) {
      currentTarget.text(textarea.value);
    }
  }
}

textarea.id = "textarea";
textarea.value = "Welcome";
textarea.style.position = 'absolute';
textarea.style.top = '50px';
textarea.style.left = '5%';
textarea.style.width = '90%';
textarea.style.height = '100px';
textarea.style.fontSize = '28px';
textarea.style.border = '1px solid black';
textarea.style.padding = '0px';
textarea.style.margin = '0px';
textarea.style.overflow = 'hidden';
textarea.style.background = 'none';
textarea.style.outline = 'none';
textarea.style.resize = 'none';
textarea.style.lineHeight = '1em';
textarea.style.fontFamily = 'Lato';
textarea.style.transformOrigin = 'left top';
textarea.style.textAlign = 'center';

const Img = ({x, y, width, height, url}) => {
  const [image] = useImage(url);
  const shapeRef = React.useRef();
  return <Image ref={shapeRef} image={image} x={x} y={y} width={width} height={height} draggable={true} onClick={onClick} onMouseOver={showHand} onMouseOut={showCursor} />;
};

function getRandomInscription(arr) {
  let inscription = arr[Math.floor(arr.length * Math.random(1))].toUpperCase();
  return inscription;
}

function getRandomMotif() {

  let files = religious.split(',');
  let file = files[Math.floor(files.length * Math.random(1))];
  let url = 'https://headstonesdesigner.com/design/html5/data/svg/motifs/' + file + '.svg';

  const regex = /#/gi;
  let id = "id_" + file.replaceAll(regex, '');
  let scale = 1, x = 0, y = 0;

  var s = document.createElement('img');
  s.src = url;
  s.id = id;
  s.style.display = "none";
  s.onload = () => {
    var i = document.querySelector('#' + id);

    scale = 120 / i.height;
    x = 200 + 150 * Math.sin((nr * 2) * 45 * (Math.PI/180));
    y = 200 + (nr * 75);
    y = 400 + 100 * Math.cos((nr * 2) * 45 * (Math.PI/180));
    nr++;

    if (nr == 1) {
      scale = 250 / i.height;
      x = 150;
      y = 0;
    }

    motifsSet.push({ 
      id: id,
      url: url,
      x: x,
      y: y,
      width: i.width * scale,
      height: i.height * scale
    })
    document.body.removeChild(s);

    if (nr > 4) {
      console.log(started);
      if (started == false) {
        started = true;
        start();
      }
    } else {
      getRandomMotif();
    }

  }

  document.body.appendChild(s);

}

function showHand() {
  document.body.style.cursor = 'pointer';
}

function showCursor() {
  document.body.style.cursor = 'default';
}

const handleDragStart = (e) => {
  document.body.style.cursor = 'pointer';
  const i = e.target.id();
  update(e);
};

const handleDragEnd = (e) => {
  document.body.style.cursor = 'default';
  const id = e.target.id();
};

const onClick = (e) => {
  update(e);
}

const update = (e) => {
  currentTarget = e.target;
  if (currentTarget.getText) {
    document.getElementById("textarea").value = e.target.getText();
  } else {
    document.getElementById("textarea").value = e.target.attrs.image.currentSrc;
  }
}

const Inscription = ({text, x, y, size}) => {
  const shapeRef = React.useRef();

  React.useEffect(() => {
    currentTarget = shapeRef.current;
  });

  return <Text  ref={shapeRef} text={text} fontFamily='Lato' fontSize={size} align="center" width={650} x={x} y={y} draggable={true} onDragStart={handleDragStart} onDragEnd={handleDragEnd} onClick={onClick} onMouseOver={showHand} onMouseOut={showCursor} />
}

const Inscriptions = ({x, y}) => {
  
  return (
    <>
    <Inscription text={getRandomInscription(inscriptions)} x={x} y={y} size={30}/>
    <Inscription text={getRandomInscription(title)} x={x} y={y += 40} size={30}/>
    <Inscription text={getRandomInscription(side ? name_m : name_f)} x={x} y={y += 60} size={60}/>
    <Inscription text={getRandomInscription(surnames)} x={x} y={y += 60} size={70}/>
    <Inscription text={"JANUARY 6, 1908"} x={x} y={y += 90} size={30}/>
    <Inscription text={"JUNE 8, 1970"} x={x} y={y += 40} size={30}/>
    <Inscription text={getRandomInscription(inscriptions)} x={x} y={y += 100} size={60}/>
    </>
  );
}

const initialRectangles = [
  {
    x: 10,
    y: 10,
    width: 100,
    height: 100,
  },
  {
    x: 150,
    y: 150,
    width: 100,
    height: 100,
    id: 'rect2',
  },
];

const Rectangle = ({ shapeProps, isSelected, onSelect, onChange, url, x, y, width, height }) => {
  const [image] = useImage(url);
  const shapeRef = React.useRef();
  const trRef = React.useRef();

  React.useEffect(() => {
    if (isSelected) {
      // we need to attach transformer manually
      trRef.current.nodes([shapeRef.current]);
      trRef.current.getLayer().batchDraw();
    }
  }, [isSelected]);

  return (
    <React.Fragment>
        <Image
        image={image} x={x} y={y} width={width} height={height}
        url={"https://headstonesdesigner.com/design/html5/data/svg/motifs/1_001_13.svg"}
        onClick={onSelect}
        onTap={onSelect}
        ref={shapeRef}
        {...shapeProps}
        draggable
        onDragEnd={(e) => {
          onChange({
            ...shapeProps,
            x: e.target.x(),
            y: e.target.y(),
          });
        }}
        onTransformEnd={(e) => {
          // transformer is changing scale of the node
          // and NOT its width or height
          // but in the store we have only width and height
          // to match the data better we will reset scale on transform end
          const node = shapeRef.current;
          const scaleX = node.scaleX();
          const scaleY = node.scaleY();

          // we will reset it back
          node.scaleX(1);
          node.scaleY(1);
          onChange({
            ...shapeProps,
            x: node.x(),
            y: node.y(),
            // set minimal value
            width: Math.max(5, node.width() * scaleX),
            height: Math.max(node.height() * scaleY),
          });
        }}
      />
      {isSelected && (
        <Transformer
          ref={trRef}
          flipEnabled={true}
          boundBoxFunc={(oldBox, newBox) => {
            // limit resize
            if (Math.abs(newBox.width) < 5 || Math.abs(newBox.height) < 5) {
              return oldBox;
            }
            return newBox;
          }}
        />
      )}
    </React.Fragment>
  );
};

const App = () => {
  
  const items = motifsSet;
  const ins_x = side ? 100 : 600;
  const motif_x = side ? 700 : 100;

  const [selectedId, selectShape] = React.useState(null);

  const checkDeselect = (e) => {
    // deselect when clicked on empty area
    const clickedOnEmpty = e.target === e.target.getStage();
    if (clickedOnEmpty) {
      selectShape(null);
    }
  };

  return (
    <Stage
    width={window.innerWidth}
    height={window.innerHeight}
    onMouseDown={checkDeselect}
    onTouchStart={checkDeselect}
  >
    <Layer>
        {items.map((item, i) => {
          return (
            <Rectangle
              url={item.url}
              key={i}
              shapeProps={item}
              isSelected={item.id === selectedId}
              onSelect={() => {
                selectShape(item.id);
              }}
              onChange={() => {
              }}
            />
          );
        })}
      </Layer>
      <Layer x={motif_x} y={200} >
        {items.map((item) => (
            <Img
                key={item.id}
                x={item.x}
                y={item.y + 20}
                width={item.width}
                height={item.height}
                url={item.url}
                draggable={true}
                onDragStart={handleDragStart}
                onDragEnd={handleDragEnd}
            />
          ))}
      </Layer>
      <Layer>
        <Inscriptions x={ins_x} y={300} />
      </Layer>
    </Stage>
  );
}


const container = document.getElementById('root');
const root = createRoot(container);

function start() {
  root.render(<App />);
}

/*
var canvas = document.createElement('canvas');
var ctx = canvas.getContext('2d');
ctx.font = 'normal 20px Lato';

var isFontLoaded = false;
var TEXT_TEXT = 'Some test text;';
var initialMeasure = ctx.measureText(TEXT_TEXT);
var initialWidth = initialMeasure.width;

function whenFontIsLoaded(callback, attemptCount) {
  if (attemptCount === undefined) {
    attemptCount = 0;
  }
  if (attemptCount >= 20) {
    callback();
    return;
  }
  if (isFontLoaded) {
    callback();
    return;
  }
  const metrics = ctx.measureText(TEXT_TEXT);
  const width = metrics.width;
  if (width !== initialWidth) {
    isFontLoaded = true;
    callback();
  } else {
    setTimeout(function () {
      whenFontIsLoaded(callback, attemptCount + 1);
    }, 100);
  }
}

whenFontIsLoaded(function () {
  text.fontFamily('Lato');
});

const text = new Konva.Text({
});
*/

/*

var svg = document.querySelector('svg');
var box = svg.viewBox.baseVal;

var aspectRatio = box.width / box.height;

function getSVG(file) {

  let url = 'https://headstonesdesigner.com/design/html5/data/svg/motifs/' + file + '.svg';
  let rf = 'https://headstonesdesigner.com/design/html5/rf.php?directory=data/svg/motifs/' + file + '.svg';

  fetch(rf)
    .then(response => response.text())
    .then(text => {  
      let vs = text.split('viewBox="');
      let v = vs[1].search('\"');
      let wh = vs[1].substring(4, v).split(" ");
      console.log('resolved');
      let o = {url: url, w: parseFloat(wh[0]), h: parseFloat(wh[1])};
      console.log(o);
      return o;
  });

}

*/
