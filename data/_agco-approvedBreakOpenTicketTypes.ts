/* global module */

"use strict";

import {Config_TicketType} from "../helpers/llmTypes";

/*
 * Source
 * https://www.agco.ca/sites/default/files/schedule_of_approved_bot_types_and_associated_expense_maximumsen.pdf
 */

const ticketTypes_AG : Config_TicketType[] = [

  {
    ticketType: "AG1",
    ticketPrice: 0.5,
    ticketCount: 3360,
    prizesPerDeal: 1115
  },
  {
    ticketType: "AG2",
    ticketPrice: 0.5,
    ticketCount: 4200,
    prizesPerDeal: 1430
  },
  {
    ticketType: "AG3",
    ticketPrice: 0.5,
    ticketCount: 2730,
    prizesPerDeal: 930
  },
  {
    ticketType: "AG4",
    ticketPrice: 0.5,
    ticketCount: 2400,
    prizesPerDeal: 817
  },
  {
    ticketType: "AG5",
    ticketPrice: 1,
    ticketCount: 2400,
    prizesPerDeal: 1635
  },
  // AG6 - AG9

  {
    ticketType: "AG10",
    ticketPrice: 1,
    ticketCount: 8400,
    prizesPerDeal: 5720
  },
  {
    ticketType: "AG11",
    ticketPrice: 0.5,
    ticketCount: 8400,
    prizesPerDeal: 2860
  },
  {
    ticketType: "AG12",
    ticketPrice: 1,
    ticketCount: 16800,
    prizesPerDeal: 11400
  },
  // AG13 - AG19

  // AG20 - AG29

  // AG30 - AG39

  // AG40 - AG49

  // AG50
  {
    ticketType: "AG51",
    ticketPrice: 1,
    ticketCount: 630,
    prizesPerDeal: 441
  },
  {
    ticketType: "AG52",
    ticketPrice: 1,
    ticketCount: 1260,
    prizesPerDeal: 882
  },
  {
    ticketType: "AG53",
    ticketPrice: 1,
    ticketCount: 570,
    prizesPerDeal: 397
  },
  // AG54
  {
    ticketType: "AG55",
    ticketPrice: 1,
    ticketCount: 210,
    prizesPerDeal: 137
  },
  {
    ticketType: "AG56",
    ticketPrice: 1,
    ticketCount: 450,
    prizesPerDeal: 294
  },
  {
    ticketType: "AG57",
    ticketPrice: 1,
    ticketCount: 680,
    prizesPerDeal: 442
  },
  // AG58 - AG59

  // AG60 - AG61

  // AG70
  {
    ticketType: "AG71",
    ticketPrice: 1,
    ticketCount: 1050,
    prizesPerDeal: 735
  },
  {
    ticketType: "AG72",
    ticketPrice: 1,
    ticketCount: 1960,
    prizesPerDeal: 1310
  },
  {
    ticketType: "AG73",
    ticketPrice: 1,
    ticketCount: 450,
    prizesPerDeal: 316
  },
  {
    ticketType: "AG74",
    ticketPrice: 1,
    ticketCount: 2000,
    prizesPerDeal: 1375
  },
  // AG75 - AG79

  // AG80
  {
    ticketType: "AG81",
    ticketPrice: 1,
    ticketCount: 570,
    prizesPerDeal: 397
  },
  {
    ticketType: "AG82",
    ticketPrice: 1,
    ticketCount: 780,
    prizesPerDeal: 530
  },
  {
    ticketType: "AG83",
    ticketPrice: 1,
    ticketCount: 610,
    prizesPerDeal: 397
  },
  {
    ticketType: "AG84",
    ticketPrice: 1,
    ticketCount: 700,
    prizesPerDeal: 490
  },
  {
    ticketType: "AG85",
    ticketPrice: 1,
    ticketCount: 750,
    prizesPerDeal: 490
  },
  {
    ticketType: "AG86",
    ticketPrice: 1,
    ticketCount: 900,
    prizesPerDeal: 585
  },
  {
    ticketType: "AG87",
    ticketPrice: 1,
    ticketCount: 510,
    prizesPerDeal: 332
  },
  {
    ticketType: "AG88",
    ticketPrice: 1,
    ticketCount: 780,
    prizesPerDeal: 507
  },
  // AG89

  {
    ticketType: "AG90",
    ticketPrice: 1,
    ticketCount: 48000,
    prizesPerDeal: 33000
  }
];

const ticketTypes_BN : Config_TicketType[] = [

  {
    ticketType: "BN1",
    ticketPrice: 0.5,
    ticketCount: 3360,
    prizesPerDeal: 1115
  },
  {
    ticketType: "BN2",
    ticketPrice: 0.25,
    ticketCount: 2940,
    prizesPerDeal: 488
  },
  {
    ticketType: "BN3",
    ticketPrice: 0.5,
    ticketCount: 2380,
    prizesPerDeal: 744
  },
  {
    ticketType: "BN4",
    ticketPrice: 1,
    ticketCount: 2520,
    prizesPerDeal: 1675
  },
  // BN5
  {
    ticketType: "BN6",
    ticketPrice: 0.5,
    ticketCount: 2380,
    prizesPerDeal: 791
  },
  {
    ticketType: "BN7",
    ticketPrice: 0.5,
    ticketCount: 1680,
    prizesPerDeal: 558
  },
  {
    ticketType: "BN8",
    ticketPrice: 1,
    ticketCount: 300,
    prizesPerDeal: 200
  },
  {
    ticketType: "BN9",
    ticketPrice: 1,
    ticketCount: 400,
    prizesPerDeal: 266
  },

  {
    ticketType: "BN10",
    ticketPrice: 2,
    ticketCount: 300,
    prizesPerDeal: 400
  },
  {
    ticketType: "BN11",
    ticketPrice: 2,
    ticketCount: 400,
    prizesPerDeal: 532
  },
  // BN12 - BN13
  {
    ticketType: "BN14",
    ticketPrice: 1,
    ticketCount: 7420,
    prizesPerDeal: 4930
  },
  // BN15 - BN19

  // BN20
  {
    ticketType: "BN21",
    ticketPrice: 0.5,
    ticketCount: 2730,
    prizesPerDeal: 930
  },
  {
    ticketType: "BN22",
    ticketPrice: 0.5,
    ticketCount: 4200,
    prizesPerDeal: 1430
  },
  {
    ticketType: "BN23",
    ticketPrice: 1,
    ticketCount: 4200,
    prizesPerDeal: 2860
  },
  {
    ticketType: "BN24",
    ticketPrice: 1,
    ticketCount: 8400,
    prizesPerDeal: 5720
  },
  // BN25
  {
    ticketType: "BN26",
    ticketPrice: 1,
    ticketCount: 16800,
    prizesPerDeal: 11440
  },
  {
    ticketType: "BN27",
    ticketPrice: 0.5,
    ticketCount: 2520,
    prizesPerDeal: 837
  },
  {
    ticketType: "BN28",
    ticketPrice: 0.5,
    ticketCount: 2280,
    prizesPerDeal: 798
  },
  {
    ticketType: "BN29",
    ticketPrice: 2,
    ticketCount: 3690,
    prizesPerDeal: 4900
  },
  {
    ticketType: "BN30",
    ticketPrice: 1,
    ticketCount: 48000,
    prizesPerDeal: 33000
  },
  {
    ticketType: "BN31",
    ticketPrice: 1,
    ticketCount: 2700,
    prizesPerDeal: 1890
  },
  // BN32 - BN49
  {
    ticketType: "BN51",
    ticketPrice: 1,
    ticketCount: 630,
    prizesPerDeal: 441
  },
  {
    ticketType: "BN52",
    ticketPrice: 1,
    ticketCount: 1260,
    prizesPerDeal: 882
  },
  // BN53
  {
    ticketType: "BN54",
    ticketPrice: 1,
    ticketCount: 420,
    prizesPerDeal: 273
  },
  {
    ticketType: "BN55",
    ticketPrice: 1,
    ticketCount: 210,
    prizesPerDeal: 137
  },
  {
    ticketType: "BN56",
    ticketPrice: 1,
    ticketCount: 450,
    prizesPerDeal: 294
  },
  {
    ticketType: "BN57",
    ticketPrice: 1,
    ticketCount: 680,
    prizesPerDeal: 442
  },
  {
    ticketType: "BN58",
    ticketPrice: 1,
    ticketCount: 750,
    prizesPerDeal: 488
  },
  {
    ticketType: "BN59",
    ticketPrice: 1,
    ticketCount: 720,
    prizesPerDeal: 504
  },
  {
    ticketType: "BN60",
    ticketPrice: 1,
    ticketCount: 1350,
    prizesPerDeal: 882
  },
  {
    ticketType: "BN61",
    ticketPrice: 1,
    ticketCount: 610,
    prizesPerDeal: 397
  },
  {
    ticketType: "BN62",
    ticketPrice: 1,
    ticketCount: 200,
    prizesPerDeal: 130
  },
  {
    ticketType: "BN63",
    ticketPrice: 1,
    ticketCount: 310,
    prizesPerDeal: 205
  },
  {
    ticketType: "BN64",
    ticketPrice: 1,
    ticketCount: 780,
    prizesPerDeal: 513
  },
  // BN65 - BN70
  {
    ticketType: "BN71",
    ticketPrice: 1,
    ticketCount: 1050,
    prizesPerDeal: 735
  },
  // BN72 - BN79
  {
    ticketType: "BN80",
    ticketPrice: 1,
    ticketCount: 780,
    prizesPerDeal: 530
  },
  {
    ticketType: "BN81",
    ticketPrice: 1,
    ticketCount: 570,
    prizesPerDeal: 397
  },
  {
    ticketType: "BN82",
    ticketPrice: 1,
    ticketCount: 560,
    prizesPerDeal: 392
  },
  {
    ticketType: "BN83",
    ticketPrice: 1,
    ticketCount: 1260,
    prizesPerDeal: 819
  },
  {
    ticketType: "BN84",
    ticketPrice: 1,
    ticketCount: 600,
    prizesPerDeal: 392
  },
  {
    ticketType: "BN85",
    ticketPrice: 1,
    ticketCount: 610,
    prizesPerDeal: 397
  },
  {
    ticketType: "BN86",
    ticketPrice: 1,
    ticketCount: 1170,
    prizesPerDeal: 819
  },
  {
    ticketType: "BN87",
    ticketPrice: 1,
    ticketCount: 1410,
    prizesPerDeal: 982
  },
  {
    ticketType: "BN88",
    ticketPrice: 1,
    ticketCount: 640,
    prizesPerDeal: 412
  },
  {
    ticketType: "BN89",
    ticketPrice: 1,
    ticketCount: 430,
    prizesPerDeal: 279
  },
  {
    ticketType: "BN90",
    ticketPrice: 1,
    ticketCount: 780,
    prizesPerDeal: 507
  },
  {
    ticketType: "BN91",
    ticketPrice: 1,
    ticketCount: 780,
    prizesPerDeal: 513
  },
  {
    ticketType: "BN92",
    ticketPrice: 1,
    ticketCount: 700,
    prizesPerDeal: 440
  },
  {
    ticketType: "BN93",
    ticketPrice: 1,
    ticketCount: 820,
    prizesPerDeal: 530
  },
  {
    ticketType: "BN94",
    ticketPrice: 1,
    ticketCount: 800,
    prizesPerDeal: 480
  },
  {
    ticketType: "BN95",
    ticketPrice: 1,
    ticketCount: 720,
    prizesPerDeal: 490
  },
  {
    ticketType: "BN96",
    ticketPrice: 1,
    ticketCount: 830,
    prizesPerDeal: 563
  }
];

const ticketTypes_PG : Config_TicketType[] = [

  {
    ticketType: "PG1",
    ticketPrice: 1,
    ticketCount: 440,
    prizesPerDeal: 286
  },
  {
    ticketType: "PG2",
    ticketPrice: 1,
    ticketCount: 600,
    prizesPerDeal: 392
  },
  {
    ticketType: "PG3",
    ticketPrice: 0.5,
    ticketCount: 3360,
    prizesPerDeal: 1115
  },
  {
    ticketType: "PG4",
    ticketPrice: 1,
    ticketCount: 320,
    prizesPerDeal: 208
  }
];

const ticketTypes_SP : Config_TicketType[] = [

  {
    ticketType: "SP1",
    ticketPrice: 0.5,
    ticketCount: 2730,
    prizesPerDeal: 930
  },
  {
    ticketType: "SP2",
    ticketPrice: 0.5,
    ticketCount: 4200,
    prizesPerDeal: 1430
  },
  {
    ticketType: "SP3",
    ticketPrice: 1,
    ticketCount: 4200,
    prizesPerDeal: 2860
  },
  // SP4 - SP9
  {
    ticketType: "SP10",
    ticketPrice: 1,
    ticketCount: 8400,
    prizesPerDeal: 5720
  },
  {
    ticketType: "SP11",
    ticketPrice: 0.5,
    ticketCount: 8400,
    prizesPerDeal: 2860
  },
  {
    ticketType: "SP12",
    ticketPrice: 1,
    ticketCount: 16800,
    prizesPerDeal: 11440
  },
  // SP13 - SP20
  {
    ticketType: "SP21",
    ticketPrice: 0.5,
    ticketCount: 3360,
    prizesPerDeal: 1115
  },
  {
    ticketType: "SP22",
    ticketPrice: 1,
    ticketCount: 7440,
    prizesPerDeal: 4940
  },
  {
    ticketType: "SP23",
    ticketPrice: 1,
    ticketCount: 33600,
    prizesPerDeal: 22880
  },
  {
    ticketType: "SP24",
    ticketPrice: 1,
    ticketCount: 7420,
    prizesPerDeal: 4930
  },
  {
    ticketType: "SP25",
    ticketPrice: 2,
    ticketCount: 8400,
    prizesPerDeal: 11440
  },
  {
    ticketType: "SP26",
    ticketPrice: 1,
    ticketCount: 500,
    prizesPerDeal: 345
  },
  {
    ticketType: "SP27",
    ticketPrice: 1,
    ticketCount: 300,
    prizesPerDeal: 205
  },
  {
    ticketType: "SP28",
    ticketPrice: 1,
    ticketCount: 420,
    prizesPerDeal: 294
  },
  {
    ticketType: "SP29",
    ticketPrice: 1,
    ticketCount: 560,
    prizesPerDeal: 392
  },
  {
    ticketType: "SP30",
    ticketPrice: 1,
    ticketCount: 460,
    prizesPerDeal: 322
  },
  {
    ticketType: "SP31",
    ticketPrice: 1,
    ticketCount: 640,
    prizesPerDeal: 448
  },
  {
    ticketType: "SP32",
    ticketPrice: 1,
    ticketCount: 700,
    prizesPerDeal: 490
  },
  {
    ticketType: "SP33",
    ticketPrice: 1,
    ticketCount: 1000,
    prizesPerDeal: 700
  },
  {
    ticketType: "SP34",
    ticketPrice: 1,
    ticketCount: 500,
    prizesPerDeal: 325
  },
  {
    ticketType: "SP35",
    ticketPrice: 1,
    ticketCount: 560,
    prizesPerDeal: 367
  },
  {
    ticketType: "SP36",
    ticketPrice: 1,
    ticketCount: 440,
    prizesPerDeal: 286
  },
  {
    ticketType: "SP37",
    ticketPrice: 1,
    ticketCount: 600,
    prizesPerDeal: 392
  },
  {
    ticketType: "SP38",
    ticketPrice: 1,
    ticketCount: 700,
    prizesPerDeal: 460
  },
  {
    ticketType: "SP39",
    ticketPrice: 1,
    ticketCount: 420,
    prizesPerDeal: 273
  },
  {
    ticketType: "SP40",
    ticketPrice: 1,
    ticketCount: 1260,
    prizesPerDeal: 882
  },
  {
    ticketType: "SP41",
    ticketPrice: 1,
    ticketCount: 1960,
    prizesPerDeal: 1372
  },
  {
    ticketType: "SP42",
    ticketPrice: 1,
    ticketCount: 812,
    prizesPerDeal: 530
  },
  {
    ticketType: "SP43",
    ticketPrice: 1,
    ticketCount: 480,
    prizesPerDeal: 312
  },
  {
    ticketType: "SP44",
    ticketPrice: 1,
    ticketCount: 2700,
    prizesPerDeal: 1890
  }
];


export const ticketTypes = ticketTypes_BN
  .concat(ticketTypes_SP)
  .concat(ticketTypes_AG)
  .concat(ticketTypes_PG);
