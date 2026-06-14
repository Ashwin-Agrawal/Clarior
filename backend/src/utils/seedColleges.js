const mongoose = require("mongoose");
const connectDB = require("../db/db");
const College = require("../models/College");

const collegesData = [
  {"name": "Banasthali Vidyapith", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1704700077phpprbORG_1280x960.jpg", "established": 1935, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Arya College of Engineering", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1744198417phpir1CD7.jpeg", "established": 2000, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "University of Engineering and Management, Jaipur", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1743070741phpP3hctg.jpeg", "established": 2011, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Amity University, Jaipur", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1491467193phpGxX4h5.jpeg", "established": 2008, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "The LNM Institute of Information Technology", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1776082048phpRBrpJl.jpeg", "established": 2002, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Jaipur Engineering College & Research Centre", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1490672980php4DOTye.jpeg", "established": 2000, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "JK Lakshmipat University", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1604396742phpXud8FD.jpeg", "established": 2011, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Jaipur National University", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1583911805phphnnvDQ.jpeg", "established": 2007, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "JECRC University", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1611837473phpHm8M7k.jpeg", "established": 2012, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Poornima University", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1745496915phpyf90RL.jpeg", "established": 2012, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Apex University", "type": "Private", "image": "https://media.collegedekho.com/media/img/institute/crawled_images/None/apex%20building%20image.JPG", "established": 2018, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Vivekananda Global University", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1557473336phpYiaqRe.jpeg", "established": 2012, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "NIMS University", "type": "Private", "image": "https://www.collegebatch.com/static/clg-gallery/nims-university-jaipur-366293.webp", "established": 2008, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Rajasthan Engineering College", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1478759761php4FZ6WX.jpeg", "established": 2000, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Nirwan University", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1604060392phprXow9A.jpeg", "established": 2017, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Jayoti Vidyapeeth Women's University", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1747997859phpa9Qkuf.jpeg", "established": 2008, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Pratap University", "type": "Private", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTs5912FhZT8OEdSQXcJciv5ziSoikE0wf7rA&s", "established": 2011, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Maharani Girls Engineering College", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1435120587php9tgVUw.jpeg", "established": 2009, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Jaipur Institute of Engineering & Technology, Kukas", "type": "Private", "image": "https://image-static.collegedunia.com/public/college_data/images/campusimage/14181965231a.jpg", "established": 2000, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "KITE - Kautilya Institute of Technology and Engineering", "type": "Private", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTzLPKHE9Dlr9VcPIyLw-6OywwOUu2kRLZtXA&s", "established": 2002, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Yagyavalkya Institute of Technology", "type": "Private", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSxceZAoe-RUVISleaKJLtGNF6cJ7eFxGcH1g&s", "established": 2002, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Compucom Institute of Technology & Management", "type": "Private", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcQ9jTxfUXi73SzaNgaAipFo-pi2jF0UKo8UwA&s", "established": 2000, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Stani Memorial College of Engineering and Technology", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1491977761php3TJD8h.jpeg", "established": 2000, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Rajdhani Engineering College", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1427277246phpF7P6EZ.png", "established": 2000, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Sri Balaji Group of Institutions", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1493205206phpbSko1I.jpeg", "established": 2006, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "JNIT - Jagan Nath Gupta Institute of Engineering and", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1490782682phpdDzWMP.png", "established": 2004, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Maharishi Arvind College of Engineering and Researc", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1480303285phpV2Y28M.jpeg", "established": 2009, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "MNIT Jaipur - Malaviya National Institute of Technology", "type": "Government", "image": "https://images.shiksha.com/mediadata/images/1756289285phpBCkD7B.jpeg", "established": 1963, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "UNIRAJ - University of Rajasthan", "type": "Government", "image": "https://images.shiksha.com/mediadata/images/1496301079phpuxqqNd.png", "established": 1947, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Central Institute of Plastics Engineering and Technology, Jaipur", "type": "Government", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcRAIF7Lthserh0cKhO3P_1RhWnaOnM5nHZnUQ&s", "established": 2006, "city": "Jaipur", "state": "Rajasthan", "common": ""},
  {"name": "Institute of Technology, Nirma University", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1762856090phpsJiwfD.jpeg", "established": 1995, "city": "Ahmedabad", "state": "Gujarat", "common": ""},
  {"name": "Indrashil University", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1530185717phpWemZhQ.jpeg", "established": 2017, "city": "Kadi (Mehsana)", "state": "Gujarat", "common": ""},
  {"name": "L D College of Engineering", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1744372177phpbk0AZO.jpeg", "established": 1948, "city": "Ahmedabad", "state": "Gujarat", "common": ""},
  {"name": "UnitedWorld Institute of Technology (UIT)", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1684225079phpXJGYOX.jpeg", "established": 2017, "city": "Gandhinagar", "state": "Gujarat", "common": ""},
  {"name": "Silver Oak College of Engineering and Technology (SOCET)", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1491542476phpixzGLo.jpeg", "established": 2009, "city": "Ahmedabad", "state": "Gujarat", "common": ""},
  {"name": "Indus University", "type": "Private", "image": "https://www.collegebatch.com/static/clg-gallery/indus-university-ahmedabad-215846.jpg", "established": 2012, "city": "Ahmedabad", "state": "Gujarat", "common": ""},
  {"name": "Adani University – Faculty of Engineering Sciences and Technology (AU-FEST)", "type": "Private", "image": "https://images.openai.com/static-rsc-4/hv2MeeLXcBUH6cq4RenFnN432eEzbWiFqxOIlt8pvAfSCc-Im0zpE86RbLsP0Vaqmcg6msvppaXv3pfLxgpi32XaxSr4CRVIY0MaCzsabscElt5f7EQAfJQpbedblaK_5a5qYohdq12jvLt4_RmBWaY6gfbIsu6L-TgOxDVTMScUW_mDmZxTuYLqWvToAzr3?purpose=fullsize", "established": 2022, "city": "Ahmedabad", "state": "Gujarat", "common": ""},
  {"name": "L.J. Institute of Engineering and Technology (L.J.I.E.T)", "type": "Private", "image": "https://images.openai.com/static-rsc-4/_iQu1UMQ4nChdPczVy5X2rSRjVbxUgvIjunsgbtJ6JA2ytTNpXbIiJJ26sLBdNJx-L1TZuD2ZMS_akz9xKVO9DlMOT1VZGGptK86K0snDHfvvgS3UHrSEdjCe0MEJwFm2h_ow43mu-psj-R6KJXSQlCPU4eMXdYoRHIvF118XBbvdfK8ZmDfZSp3amXLUuau?purpose=fullsize", "established": 2007, "city": "Ahmedabad", "state": "Gujarat", "common": ""},
  {"name": "Swarrnim Startup and Innovation University", "type": "Private", "image": "https://images.openai.com/static-rsc-4/GaqqvZ5W6bgpen-DRdWxrQwBnH5fL1dJByeUfmdo0IAqze5M_YNwgAgybVnNcdU3cR5ywPmetFPbkkCRf2B8AMkKliwyYMjr6xePiqTxK0KYtuvYogQlmdKGRQRzp0xf0YYt_iIWxmRHMqta0DyfR8pfxWz4aUfBN7cCgr5HNzJnQvkB2Sv8twJPGxgiZKW3?purpose=fullsize", "established": 2017, "city": "Gandhinagar", "state": "Gujarat", "common": ""},
  {"name": "Aditya Silver Oak Institute of Technology (ASOIT)", "type": "Private", "image": "https://images.openai.com/static-rsc-4/MPXlA97nhC0m3PY3-iqtPYR8GQocDV4M8jY3wMMLrbcnUwpM5S_9vaX56XEPNsyiQoUuskp_H36gprmhVXPMc5uKzvy2BN5PlHPHC6dgVnRjugA31mKbhWuzY1LCtsO5H3BT8J7NwjxutdcuV-Oruz7KnbUGJzeITdx7toguOhKUG8usC9yPlKr9QYbmsKgQ?purpose=fullsize", "established": 2014, "city": "Ahmedabad", "state": "Gujarat", "common": ""},
  {"name": "Ahmedabad Institute of Technology", "type": "Private", "image": "https://images.openai.com/static-rsc-4/plapIGjebvFJKTHfq1vy8khgIRSdSR-kiVPfEj9AkL20RmN-NRT3jx0kBp8u1pBGXGnpAbuiRyFgzk9NWstuO9QVxQfu8749YabyNlKIVSzWY_u16OpYqPhgX0uDm4gRj7M7u0MIzSeVR8r43sup1C-pLqhpe1-GMjdZm4KWwSKE6RYfF8iJA6D5NEPg63yC?purpose=fullsize", "established": 2004, "city": "Ahmedabad", "state": "Gujarat", "common": ""},
  {"name": "CEPT University", "type": "Private", "image": "https://images.openai.com/static-rsc-4/XucfoIhDWh2o_XVLOywR5Dg13-aYTjCbEkMUkuef7--2aLAwuHoQpJ9jUlaSk3t0M63p2qH1O-IgLH9zWMKab-hqTNEAx0QFLGj_loXRehTYsOllm-oGJmA1ftiWhEmn1JLfvUCejBiWnXXob-9sWVxKnKk-B74jI8iZDa_wDwHlW3P8iTs33zBDRR4UBWZL?purpose=fullsize", "established": 1962, "city": "Ahmedabad", "state": "Gujarat", "common": ""},
  {"name": "GLS University, Ahmedabad", "type": "Private", "image": "https://images.openai.com/static-rsc-4/gFczKdIbykrHPDlEY8vflF76assWS84BE4wKaVz3_SIleavCFtYdrv9MzefLkbPz-l4mDzZ4sorDrK1PVWeI7mRqNOSwnmbYL8_-blXfptu6YaY6E3t2Fr9gHMZaPUAZhdkhIYNecw6cSD8z_C2AKsEzaNrHGgI4Vpf9BQCPowm0WDwOU4LivVBDUMw-oFY2?purpose=fullsize", "established": 2015, "city": "Ahmedabad", "state": "Gujarat", "common": ""},
  {"name": "Swarrnim Startup and Innovation University", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1540191753phptOqxed.jpeg", "established": 2017, "city": "Gandhinagar", "state": "Gujarat", "common": ""},
  {"name": "Monark University", "type": "Private", "image": "https://images.openai.com/static-rsc-4/C4T7Wdr_5frw155GOL6h3prxCHTDF9r4E9N4SMLrFMdwI5tv670t3UpO9Wa1rBIk7PdO_B1krJPA9pGb073Jey0NGZcGBDwW0LOy6cU9b6EN6jmuZj9P_R-EXCb7bsXoYcr3_f_jV2ovnB5D7WDH1jjdxIglcBS7j9418GugbaiXuFgzQTAMGZ6hi1eDTjVL?purpose=fullsize", "established": 2021, "city": "Ahmedabad", "state": "Gujarat", "common": ""},
  {"name": "Hasmukh Goswami College of Engineering", "type": "Private", "image": "https://images.openai.com/static-rsc-4/jOlqIZ8rXqj6y-eioazXF3zfqZnxB3HwdVgZ_U9IdsLhhd5X95XIov7wsdy8Z58vJXXoFp8YgMmhPFhnPetcHXAcydOqf3tojBFjQjBpOoSxWVrlIZhuF-_0vl3VWoev1PdAs5sPyOUCViroQ3loApjp8vWKYktp8UC6lW0Zw9KlZ-7KwtSWxqvSf87MlLbi?purpose=fullsize", "established": 2007, "city": "Ahmedabad", "state": "Gujarat", "common": ""},
  {"name": "Narnarayan Shastri Institute of Technology", "type": "Private", "image": "https://images.openai.com/static-rsc-4/TLmohb3SlPl5HXnMSSvng8-KtzhUZJYF5lBjQ3wNLN7ubtjMDVjPJAqh_bQZKy9Kdfig_2cUv53D-6SsbXHkerstatIT3j8FCzyhoXbM3HYCSZd6moB-EZ3--s9b6NHFdSBpRlwJEIY6Y6gktSKYu1uX4M_Nf-aYUHhd4q4lid8?purpose=inline", "established": 2008, "city": "Ahmedabad", "state": "Gujarat", "common": ""},
  {"name": "Amiraj College of Engineering and Technology", "type": "Private", "image": "https://images.openai.com/static-rsc-4/69AaKSuW6YGv8L4XvsirfpWbw38srVCYswaeF2mQURZ1-PsXdtMjNhl4RuZ8x77DuPYkcjVaf35YyUvaAUgFkDIIdhrh0OxZKoRMGM5dIgAPlhW9uZ_NmJGDVcmvJ2zccES9LkAt0GkrTutDqQTGznodA1vl_n0MKChBKZ4ECs8?purpose=inline", "established": 2012, "city": "Ahmedabad", "state": "Gujarat", "common": ""},
  {"name": "SAL College of Engineering", "type": "Private", "image": "https://images.openai.com/static-rsc-4/mTdUryYIbtR4LsxSL8B9l6T0IdI9z9DDEcqI4v7JXJeuNNEK5_jDvQZ7t0Cd7BXkLx5mc0nhBw8Ur2WzbX_J3XdKVQ-pFZJKHgOvX1yTYVZS5GJexWBzJY7btkIks3Ii1mlRZ4OrMNi6pO_sRYR35GP73B1__VGkxjP5PO9xOU0?purpose=inline", "established": 2009, "city": "Ahmedabad", "state": "Gujarat", "common": ""},
  {"name": "Vishwakarma Government Engineering College", "type": "Government", "image": "https://images.shiksha.com/mediadata/images/1554112720phpZDwHnW.jpeg", "established": 1994, "city": "Ahmedabad", "state": "Gujarat", "common": ""},
  {"name": "Gujarat Technological University", "type": "Government", "image": "https://images.openai.com/static-rsc-4/ww5Ek_TOU4NNNYl4H__P17ylSFwYYIcaF7BH6UL60XCjlEBux-hIXmKORXtFFzXpZgdE82oBcO_GviTcE7j4OFsHXEGLZQy6sxSZ0hMfinJijGoQGSlo9fm0U8BheiU769G0tCk42NJk9dzLGM_KSR7cOwfqwWCFBOEwPd2MEHtKKsvXFE1I49nFUm3tZvPj?purpose=fullsize", "established": 2007, "city": "Ahmedabad", "state": "Gujarat", "common": ""},
  {"name": "Amity University, Noida", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1742796182phpyQnOST.jpeg", "established": 2005, "city": "Noida", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "Amity University, Gurugram", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1680077886phpbRnVBK.jpeg", "established": 2010, "city": "Gurugram", "state": "Haryana", "common": "DELHI-NCR"},
  {"name": "Galgotias University", "type": "Private", "image": "https://www.galgotiasuniversity.edu.in/public/uploads/media/2rrtkeYKBpWA2vKU7w2SZn4S6L69V7hHh4krm6Zx.webp", "established": 2011, "city": "Greater Noida", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "K.R. Mangalam University", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1768899011phpeYGCoA.jpeg", "established": 2013, "city": "Gurugram", "state": "Haryana", "common": "DELHI-NCR"},
  {"name": "Dronacharya College of Engineering", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1748511393php53MKR7.jpeg", "established": 1998, "city": "Gurugram", "state": "Haryana", "common": "DELHI-NCR"},
  {"name": "Jaypee Institute of Information Technology", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1587371272phpazaLze.jpeg", "established": 2001, "city": "Noida", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "Noida Institute of Engineering and Technology (NIET)", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1642425392phplAHaCD.jpeg", "established": 2001, "city": "Greater Noida", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "Manav Rachna International Institute of Research & Studies", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1779257760phpWnO8il.jpeg", "established": 1997, "city": "Faridabad", "state": "Haryana", "common": "DELHI-NCR"},
  {"name": "KCC Institute of Technology and Management", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1656072461phpvxIkaz.jpeg", "established": 2008, "city": "Greater Noida", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "Lloyd Institute of Engineering and Technology", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1623917427phpEXse9D.jpeg", "established": 2002, "city": "Greater Noida", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "Sharda University", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1620102833phpytgFpn.jpeg", "established": 2009, "city": "Greater Noida", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "G.L. Bajaj Institute of Technology and Management", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1507374080php7Y15dy.jpeg", "established": 2005, "city": "Greater Noida", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "The NorthCap University", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1589879855phpkgZXOg.jpeg", "established": 1996, "city": "Gurugram", "state": "Haryana", "common": "DELHI-NCR"},
  {"name": "Greater Noida Institute of Technology", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1499333475phpY9hQNo.jpeg", "established": 2001, "city": "Greater Noida", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "World College of Technology and Management", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1714472619phpzqEW91.jpeg", "established": 2007, "city": "Gurugram", "state": "Haryana", "common": "DELHI-NCR"},
  {"name": "KIET University", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1687164363phpjopSjv.jpeg", "established": 1998, "city": "Ghaziabad", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "Galgotias College of Engineering and Technology", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1754549862php1KB54k.jpeg", "established": 2000, "city": "Greater Noida", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "JSS Academy of Technical Education, JSS Mahavidyapeetha, Noida", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1745240941phpkwIH1x.jpeg", "established": 1998, "city": "Noida", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "DPG Institute of Technology and Management", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1523271890phpeDoKBQ.jpeg", "established": 2011, "city": "Gurugram", "state": "Haryana", "common": "DELHI-NCR"},
  {"name": "Manav Rachna University [MRU]", "type": "Private", "image": "https://manavrachna.edu.in/assets/campus/mriirs/images/mri-about-1.webp", "established": 2004, "city": "Faridabad", "state": "Haryana", "common": "DELHI-NCR"},
  {"name": "Maharaja Agrasen Institute of Technology", "type": "Private", "image": "https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcSnOKU3ZNodvW3XF-16udVVgBIRo1YZPoW6KQ&s", "established": 1999, "city": "Rohini, Delhi", "state": "Delhi", "common": "DELHI-NCR"},
  {"name": "Delhi Technical Campus, Greater Noida", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1590565405phpE0IVpc.jpeg", "established": 2013, "city": "Greater Noida", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "Maharaja Surajmal Institute of Technology", "type": "Private", "image": "https://www.msit.in/static/img/mainPage/slide_9.jpg", "established": 1979, "city": "Janakpuri, Delhi", "state": "Delhi", "common": "DELHI-NCR"},
  {"name": "Ajay Kumar Garg Engineering College", "type": "Private", "image": "https://static.boostmytalent.com/img/univ/ajay-kumar-garg-college-ghaziabad-campus-admission.webp", "established": 1998, "city": "Ghaziabad", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "Bharati Vidyapeeth College of Engineering, Delhi", "type": "Private", "image": "https://bvcoend.ac.in/wp-content/uploads/2023/09/Screenshot-2023-09-06-132736.png", "established": 1999, "city": "Paschim Vihar, Delhi", "state": "Delhi", "common": "DELHI-NCR"},
  {"name": "IIMT Group of Colleges, Greater Noida", "type": "Private", "image": "https://collegeassist.in/_next/image?url=https%3A%2F%2Fnurturflows.s3.ap-south-1.amazonaws.com%2Fbanner%2F17812_V.png&w=828&q=75", "established": 1994, "city": "Greater Noida", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "SRM University, Delhi-NCR, Sonepat, Haryana (SRMUH)", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1623317518phpjVsAy4.jpeg", "established": 2013, "city": "Sonipat", "state": "Haryana", "common": "DELHI-NCR"},
  {"name": "School of Engineering and Technology, Manav Rachna International Institute of Research and Studies", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1518440989php88VSCr.jpeg", "established": 1997, "city": "Faridabad", "state": "Haryana", "common": "DELHI-NCR"},
  {"name": "Geeta University", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1773140745phpfh4ZY7.jpeg", "established": 2022, "city": "Panipat", "state": "Haryana", "common": "DELHI-NCR"},
  {"name": "Mangalmay Institute of Engineering and Technology", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1741603244php3nzhUH.jpeg", "established": 2002, "city": "Greater Noida", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "IMS Engineering College", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1745923873phpwFRnRE.jpeg", "established": 2002, "city": "Ghaziabad", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "GLA University – Greater Noida Campus", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1723543710phpW7y0yv.jpeg", "established": 2024, "city": "Greater Noida", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "Shobhit Institute of Engineering and Technology", "type": "Private", "image": "https://lh3.googleusercontent.com/gps-cs-s/APNQkAGw17_t-Vwjg2ks07dMvb6k6hrk_M1cd_SMCVT4Ib3ePfFDmkszJCW2OcjZ4X6zvSQqUGQuQEwkEjPo-EBuUL0OTIKoLCx_pQjJAjQ0rHC0uCv2pTCqCg9uoO_Vncu8xC0HCku__A=s1360-w1360-h1020-rw", "established": 2000, "city": "Meerut", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "Ganga Institute of Technology and Management", "type": "Private", "image": "https://www.searchurcollege.com/exam/admin/search/gallery/college/col_188.jpg", "established": 2008, "city": "Jhajjar", "state": "Haryana", "common": "DELHI-NCR"},
  {"name": "JIMS Engineering Management Technical Campus", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1559798216phpLBw2gx.jpeg", "established": 2008, "city": "Greater Noida", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "ABES Engineering College", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1494566683phpZgcM81.jpeg", "established": 2000, "city": "Ghaziabad", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "St. Andrews Institute of Technology and Management", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1674639110phpmHR8LM.jpeg", "established": 2012, "city": "Gurugram", "state": "Haryana", "common": "DELHI-NCR"},
  {"name": "ITS Engineering College", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1742271457phpCv77Gd.jpeg", "established": 2006, "city": "Greater Noida", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "Shriram Institute of Technology (SRIT)", "type": "Private", "image": "https://images-hostinger.suggestcollege.com//media/colleges/cover/colleges/logo/15092_SRIT_NEW.jpg", "established": 2007, "city": "Meerut", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "Meerut Institute of Engineering and Technology", "type": "Private", "image": "https://www.highereducationdigest.com/wp-content/uploads/2022/09/Meerut-Institute-of-Engineering-and-Technology-550x330.jpg", "established": 1997, "city": "Meerut", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "B M Group of Institutions (BMGI)", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1776746892phpEfZxws.jpeg", "established": 2007, "city": "Gurugram", "state": "Haryana", "common": "DELHI-NCR"},
  {"name": "Echelon Institute of Technology", "type": "Private", "image": "https://eitfaridabad.com/blog/wp-content/uploads/2023/01/campus1.webp", "established": 2007, "city": "Faridabad", "state": "Haryana", "common": "DELHI-NCR"},
  {"name": "Bennett University", "type": "Private", "image": "https://www.reviewadda.com/assets/uploads/article_images/Bennet_University_Noida.jpg", "established": 2016, "city": "Greater Noida", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "Shiv Nadar University (SNU)", "type": "Private", "image": "https://snu.edu.in/site/assets/files/7907/shss_2.1600x0.webp", "established": 2011, "city": "Greater Noida", "state": "Uttar Pradesh", "common": "DELHI-NCR"},
  {"name": "GD Goenka University", "type": "Private", "image": "https://static.boostmytalent.com/img/univ/gd-goenka-gurgaon-campus-building.webp", "established": 2013, "city": "Gurugram", "state": "Haryana", "common": "DELHI-NCR"},
  {"name": "Rishihood University", "type": "Private", "image": "https://images.shiksha.com/mediadata/images/1687532322phpREcKoz.jpeg", "established": 2020, "city": "Sonepat", "state": "Haryana", "common": "DELHI-NCR"},
  {"name": "Guru Tegh Bahadur Institute of Technology", "type": "Private", "image": "https://img.collegepravesh.com/2016/01/GTBIT-Delhi.jpg", "established": 1999, "city": "Rajouri Garden, Delhi", "state": "Delhi", "common": "DELHI-NCR"},
  {"name": "SGT University, Gurgaon", "type": "Private", "image": "https://f2.leadsquaredcdn.com/t/sgtuni/content/common/images/admAboutImg.jpg", "established": 2013, "city": "Gurugram", "state": "Haryana", "common": "DELHI-NCR"},
  {"name": "PIET - Panipat Institute of Engineering and Technology", "type": "Private", "image": "https://media.collegedekho.com/media/img/institute/crawled_images/Block-DE.png", "established": 2006, "city": "Panipat", "state": "Haryana", "common": "DELHI-NCR"}
];

async function seedColleges() {
  try {
    // Check connection state or connect
    if (mongoose.connection.readyState === 0) {
      await connectDB();
    }

    console.log("🧹 Clearing old colleges...");
    await College.deleteMany({});
    console.log("Deleted old colleges successfully.");

    // Deduplicate collegesData by name before inserting
    const uniqueColleges = [];
    const seenNames = new Set();
    for (const c of collegesData) {
      const normalizedName = c.name.trim().toLowerCase();
      if (!seenNames.has(normalizedName)) {
        seenNames.add(normalizedName);
        uniqueColleges.push(c);
      }
    }

    console.log(`🌱 Inserting ${uniqueColleges.length} unique colleges (filtered from ${collegesData.length} total)...`);
    const result = await College.insertMany(uniqueColleges);
    console.log(`✅ Seeded ${result.length} colleges successfully!`);

  } catch (error) {
    console.error("❌ Seeding colleges failed:", error.message);
  } finally {
    // If we connected within the script, we close the connection
    if (mongoose.connection.readyState !== 0) {
      await mongoose.disconnect();
      console.log("🔌 MongoDB disconnected");
    }
  }
}

// Run the script directly if invoked from command line
if (require.main === module) {
  seedColleges().then(() => {
    process.exit(0);
  }).catch((err) => {
    console.error("Fatal seed error:", err);
    process.exit(1);
  });
}

module.exports = seedColleges;
