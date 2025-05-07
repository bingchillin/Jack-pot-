--
-- PostgreSQL database dump
--

-- Dumped from database version 15.12 (Homebrew)
-- Dumped by pg_dump version 15.12 (Homebrew)

SET statement_timeout = 0;
SET lock_timeout = 0;
SET idle_in_transaction_session_timeout = 0;
SET client_encoding = 'UTF8';
SET standard_conforming_strings = on;
SELECT pg_catalog.set_config('search_path', '', false);
SET check_function_bodies = false;
SET xmloption = content;
SET client_min_messages = warning;
SET row_security = off;

SET default_tablespace = '';

SET default_table_access_method = heap;

--
-- Name: avatar; Type: TABLE; Schema: public; Owner: zrzr
--

CREATE TABLE public.avatar (
    id_avatar integer NOT NULL,
    title character varying(250),
    description character varying(1000),
    picture_path character varying(5000),
    evolution_number integer,
    id_plant_type integer
);


ALTER TABLE public.avatar OWNER TO zrzr;

--
-- Name: avatar_id_avatar_seq; Type: SEQUENCE; Schema: public; Owner: zrzr
--

CREATE SEQUENCE public.avatar_id_avatar_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.avatar_id_avatar_seq OWNER TO zrzr;

--
-- Name: avatar_id_avatar_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zrzr
--

ALTER SEQUENCE public.avatar_id_avatar_seq OWNED BY public.avatar.id_avatar;


--
-- Name: category_type; Type: TABLE; Schema: public; Owner: zrzr
--

CREATE TABLE public.category_type (
    id_category_type integer NOT NULL,
    title character varying(250),
    description character varying(1000),
    advise character varying(5000)
);


ALTER TABLE public.category_type OWNER TO zrzr;

--
-- Name: category_type_id_category_type_seq; Type: SEQUENCE; Schema: public; Owner: zrzr
--

CREATE SEQUENCE public.category_type_id_category_type_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.category_type_id_category_type_seq OWNER TO zrzr;

--
-- Name: category_type_id_category_type_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zrzr
--

ALTER SEQUENCE public.category_type_id_category_type_seq OWNED BY public.category_type.id_category_type;


--
-- Name: composant; Type: TABLE; Schema: public; Owner: zrzr
--

CREATE TABLE public.composant (
    id_composant integer NOT NULL,
    title character varying(250),
    description character varying(1000),
    is_working boolean DEFAULT false NOT NULL,
    int_ret integer,
    string_ret character varying(100),
    long_ret bigint,
    id_object integer
);


ALTER TABLE public.composant OWNER TO zrzr;

--
-- Name: composant_id_composant_seq; Type: SEQUENCE; Schema: public; Owner: zrzr
--

CREATE SEQUENCE public.composant_id_composant_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.composant_id_composant_seq OWNER TO zrzr;

--
-- Name: composant_id_composant_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zrzr
--

ALTER SEQUENCE public.composant_id_composant_seq OWNED BY public.composant.id_composant;


--
-- Name: contact; Type: TABLE; Schema: public; Owner: zrzr
--

CREATE TABLE public.contact (
    id_contact integer NOT NULL,
    relation character varying(250),
    description character varying(1000),
    is_active boolean DEFAULT false NOT NULL,
    value_return character varying(100),
    id_person integer,
    id_relationship integer
);


ALTER TABLE public.contact OWNER TO zrzr;

--
-- Name: contact_id_contact_seq; Type: SEQUENCE; Schema: public; Owner: zrzr
--

CREATE SEQUENCE public.contact_id_contact_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.contact_id_contact_seq OWNER TO zrzr;

--
-- Name: contact_id_contact_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zrzr
--

ALTER SEQUENCE public.contact_id_contact_seq OWNED BY public.contact.id_contact;


--
-- Name: event_party; Type: TABLE; Schema: public; Owner: zrzr
--

CREATE TABLE public.event_party (
    id_event_party integer NOT NULL,
    title character varying(250) NOT NULL,
    description character varying(5000) NOT NULL,
    "isLaunch" boolean DEFAULT false NOT NULL,
    "beginDate" date,
    "endDate" date,
    rules character varying(5000),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.event_party OWNER TO zrzr;

--
-- Name: event_party_id_event_party_seq; Type: SEQUENCE; Schema: public; Owner: zrzr
--

CREATE SEQUENCE public.event_party_id_event_party_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.event_party_id_event_party_seq OWNER TO zrzr;

--
-- Name: event_party_id_event_party_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zrzr
--

ALTER SEQUENCE public.event_party_id_event_party_seq OWNED BY public.event_party.id_event_party;


--
-- Name: game; Type: TABLE; Schema: public; Owner: zrzr
--

CREATE TABLE public.game (
    id_game integer NOT NULL,
    title character varying(250) NOT NULL,
    description character varying(5000) NOT NULL,
    "idWon" integer,
    "idLose" integer,
    "beginDate" date,
    "endDate" date,
    rules character varying(5000),
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    id_event_party integer
);


ALTER TABLE public.game OWNER TO zrzr;

--
-- Name: game_id_game_seq; Type: SEQUENCE; Schema: public; Owner: zrzr
--

CREATE SEQUENCE public.game_id_game_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.game_id_game_seq OWNER TO zrzr;

--
-- Name: game_id_game_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zrzr
--

ALTER SEQUENCE public.game_id_game_seq OWNED BY public.game.id_game;


--
-- Name: game_person; Type: TABLE; Schema: public; Owner: zrzr
--

CREATE TABLE public.game_person (
    id_game_person integer NOT NULL,
    "isOwner" boolean DEFAULT false NOT NULL,
    "isPlayer" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    id_game integer,
    id_person integer
);


ALTER TABLE public.game_person OWNER TO zrzr;

--
-- Name: game_person_id_game_person_seq; Type: SEQUENCE; Schema: public; Owner: zrzr
--

CREATE SEQUENCE public.game_person_id_game_person_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.game_person_id_game_person_seq OWNER TO zrzr;

--
-- Name: game_person_id_game_person_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zrzr
--

ALTER SEQUENCE public.game_person_id_game_person_seq OWNED BY public.game_person.id_game_person;


--
-- Name: lnk_participation_person_event_party; Type: TABLE; Schema: public; Owner: zrzr
--

CREATE TABLE public.lnk_participation_person_event_party (
    id_lnk_participation_person_event_party integer NOT NULL,
    id_person integer,
    id_event_party integer,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.lnk_participation_person_event_party OWNER TO zrzr;

--
-- Name: lnk_participation_person_even_id_lnk_participation_person_e_seq; Type: SEQUENCE; Schema: public; Owner: zrzr
--

CREATE SEQUENCE public.lnk_participation_person_even_id_lnk_participation_person_e_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lnk_participation_person_even_id_lnk_participation_person_e_seq OWNER TO zrzr;

--
-- Name: lnk_participation_person_even_id_lnk_participation_person_e_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zrzr
--

ALTER SEQUENCE public.lnk_participation_person_even_id_lnk_participation_person_e_seq OWNED BY public.lnk_participation_person_event_party.id_lnk_participation_person_event_party;


--
-- Name: lnk_person_parameter; Type: TABLE; Schema: public; Owner: zrzr
--

CREATE TABLE public.lnk_person_parameter (
    id_lnk_person_parameter integer NOT NULL,
    is_value boolean DEFAULT false NOT NULL,
    id_person integer,
    id_parameter_type integer
);


ALTER TABLE public.lnk_person_parameter OWNER TO zrzr;

--
-- Name: lnk_person_parameter_id_lnk_person_parameter_seq; Type: SEQUENCE; Schema: public; Owner: zrzr
--

CREATE SEQUENCE public.lnk_person_parameter_id_lnk_person_parameter_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.lnk_person_parameter_id_lnk_person_parameter_seq OWNER TO zrzr;

--
-- Name: lnk_person_parameter_id_lnk_person_parameter_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zrzr
--

ALTER SEQUENCE public.lnk_person_parameter_id_lnk_person_parameter_seq OWNED BY public.lnk_person_parameter.id_lnk_person_parameter;


--
-- Name: notification; Type: TABLE; Schema: public; Owner: zrzr
--

CREATE TABLE public.notification (
    id_notification integer NOT NULL,
    title character varying(250),
    description character varying(1000),
    value_custom_01 character varying(500),
    value_custom_02 character varying(500),
    id_object integer,
    id_person integer
);


ALTER TABLE public.notification OWNER TO zrzr;

--
-- Name: notification_id_notification_seq; Type: SEQUENCE; Schema: public; Owner: zrzr
--

CREATE SEQUENCE public.notification_id_notification_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.notification_id_notification_seq OWNER TO zrzr;

--
-- Name: notification_id_notification_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zrzr
--

ALTER SEQUENCE public.notification_id_notification_seq OWNED BY public.notification.id_notification;


--
-- Name: object; Type: TABLE; Schema: public; Owner: zrzr
--

CREATE TABLE public.object (
    id_object integer NOT NULL,
    title character varying(250),
    description character varying(1000),
    is_working boolean DEFAULT false NOT NULL,
    is_automatic boolean DEFAULT false NOT NULL,
    value_return character varying(100),
    height character varying(100),
    weight character varying(100),
    advise character varying(100),
    preference_number integer,
    id_person integer,
    id_category_type integer
);


ALTER TABLE public.object OWNER TO zrzr;

--
-- Name: object_id_object_seq; Type: SEQUENCE; Schema: public; Owner: zrzr
--

CREATE SEQUENCE public.object_id_object_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.object_id_object_seq OWNER TO zrzr;

--
-- Name: object_id_object_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zrzr
--

ALTER SEQUENCE public.object_id_object_seq OWNED BY public.object.id_object;


--
-- Name: object_profile; Type: TABLE; Schema: public; Owner: zrzr
--

CREATE TABLE public.object_profile (
    id_object_profile integer NOT NULL,
    title character varying(250),
    description character varying(1000),
    price character varying(500),
    height character varying(100),
    weight character varying(100),
    advise character varying(100),
    category character varying(100),
    strenght character varying(100),
    speed character varying(100),
    life character varying(100),
    id_object integer,
    id_plant_type integer
);


ALTER TABLE public.object_profile OWNER TO zrzr;

--
-- Name: object_profile_id_object_profile_seq; Type: SEQUENCE; Schema: public; Owner: zrzr
--

CREATE SEQUENCE public.object_profile_id_object_profile_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.object_profile_id_object_profile_seq OWNER TO zrzr;

--
-- Name: object_profile_id_object_profile_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zrzr
--

ALTER SEQUENCE public.object_profile_id_object_profile_seq OWNED BY public.object_profile.id_object_profile;


--
-- Name: parameter_type; Type: TABLE; Schema: public; Owner: zrzr
--

CREATE TABLE public.parameter_type (
    id_parameter_type integer NOT NULL,
    title character varying(250),
    short_description character varying(1000),
    description character varying(5000),
    is_display boolean DEFAULT false NOT NULL
);


ALTER TABLE public.parameter_type OWNER TO zrzr;

--
-- Name: parameter_type_id_parameter_type_seq; Type: SEQUENCE; Schema: public; Owner: zrzr
--

CREATE SEQUENCE public.parameter_type_id_parameter_type_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.parameter_type_id_parameter_type_seq OWNER TO zrzr;

--
-- Name: parameter_type_id_parameter_type_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zrzr
--

ALTER SEQUENCE public.parameter_type_id_parameter_type_seq OWNED BY public.parameter_type.id_parameter_type;


--
-- Name: person; Type: TABLE; Schema: public; Owner: zrzr
--

CREATE TABLE public.person (
    id_person integer NOT NULL,
    mail character varying(250) NOT NULL,
    firstname character varying(250) NOT NULL,
    surname character varying(250) NOT NULL,
    password character varying(500) NOT NULL,
    number_phone character varying(50),
    id_role integer,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.person OWNER TO zrzr;

--
-- Name: person_id_person_seq; Type: SEQUENCE; Schema: public; Owner: zrzr
--

CREATE SEQUENCE public.person_id_person_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.person_id_person_seq OWNER TO zrzr;

--
-- Name: person_id_person_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zrzr
--

ALTER SEQUENCE public.person_id_person_seq OWNED BY public.person.id_person;


--
-- Name: plant; Type: TABLE; Schema: public; Owner: zrzr
--

CREATE TABLE public.plant (
    id_plant integer NOT NULL,
    name character varying(100) NOT NULL,
    description character varying(500) NOT NULL,
    price numeric(10,2) NOT NULL,
    category character varying(50) NOT NULL,
    "isAvailable" boolean DEFAULT true NOT NULL,
    id_person integer,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL
);


ALTER TABLE public.plant OWNER TO zrzr;

--
-- Name: plant_id_plant_seq; Type: SEQUENCE; Schema: public; Owner: zrzr
--

CREATE SEQUENCE public.plant_id_plant_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.plant_id_plant_seq OWNER TO zrzr;

--
-- Name: plant_id_plant_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zrzr
--

ALTER SEQUENCE public.plant_id_plant_seq OWNED BY public.plant.id_plant;


--
-- Name: plant_person; Type: TABLE; Schema: public; Owner: zrzr
--

CREATE TABLE public.plant_person (
    id_plant_person integer NOT NULL,
    "isOwner" boolean DEFAULT false NOT NULL,
    "isSeller" boolean DEFAULT false NOT NULL,
    "createdAt" timestamp without time zone DEFAULT now() NOT NULL,
    "updatedAt" timestamp without time zone DEFAULT now() NOT NULL,
    id_plant integer,
    id_person integer
);


ALTER TABLE public.plant_person OWNER TO zrzr;

--
-- Name: plant_person_id_plant_person_seq; Type: SEQUENCE; Schema: public; Owner: zrzr
--

CREATE SEQUENCE public.plant_person_id_plant_person_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.plant_person_id_plant_person_seq OWNER TO zrzr;

--
-- Name: plant_person_id_plant_person_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zrzr
--

ALTER SEQUENCE public.plant_person_id_plant_person_seq OWNED BY public.plant_person.id_plant_person;


--
-- Name: plant_type; Type: TABLE; Schema: public; Owner: zrzr
--

CREATE TABLE public.plant_type (
    id_plant_type integer NOT NULL,
    title character varying(250),
    description character varying(1000),
    height character varying(100),
    weight character varying(100),
    advise character varying(5000),
    category character varying(5000)
);


ALTER TABLE public.plant_type OWNER TO zrzr;

--
-- Name: plant_type_id_plant_type_seq; Type: SEQUENCE; Schema: public; Owner: zrzr
--

CREATE SEQUENCE public.plant_type_id_plant_type_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.plant_type_id_plant_type_seq OWNER TO zrzr;

--
-- Name: plant_type_id_plant_type_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zrzr
--

ALTER SEQUENCE public.plant_type_id_plant_type_seq OWNED BY public.plant_type.id_plant_type;


--
-- Name: relationship; Type: TABLE; Schema: public; Owner: zrzr
--

CREATE TABLE public.relationship (
    id_relationship integer NOT NULL,
    title character varying(250) NOT NULL,
    description character varying(1000)
);


ALTER TABLE public.relationship OWNER TO zrzr;

--
-- Name: relationship_id_relationship_seq; Type: SEQUENCE; Schema: public; Owner: zrzr
--

CREATE SEQUENCE public.relationship_id_relationship_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.relationship_id_relationship_seq OWNER TO zrzr;

--
-- Name: relationship_id_relationship_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zrzr
--

ALTER SEQUENCE public.relationship_id_relationship_seq OWNED BY public.relationship.id_relationship;


--
-- Name: role; Type: TABLE; Schema: public; Owner: zrzr
--

CREATE TABLE public.role (
    id_role integer NOT NULL,
    title character varying(250) NOT NULL,
    description character varying(1000)
);


ALTER TABLE public.role OWNER TO zrzr;

--
-- Name: role_id_role_seq; Type: SEQUENCE; Schema: public; Owner: zrzr
--

CREATE SEQUENCE public.role_id_role_seq
    AS integer
    START WITH 1
    INCREMENT BY 1
    NO MINVALUE
    NO MAXVALUE
    CACHE 1;


ALTER TABLE public.role_id_role_seq OWNER TO zrzr;

--
-- Name: role_id_role_seq; Type: SEQUENCE OWNED BY; Schema: public; Owner: zrzr
--

ALTER SEQUENCE public.role_id_role_seq OWNED BY public.role.id_role;


--
-- Name: avatar id_avatar; Type: DEFAULT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.avatar ALTER COLUMN id_avatar SET DEFAULT nextval('public.avatar_id_avatar_seq'::regclass);


--
-- Name: category_type id_category_type; Type: DEFAULT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.category_type ALTER COLUMN id_category_type SET DEFAULT nextval('public.category_type_id_category_type_seq'::regclass);


--
-- Name: composant id_composant; Type: DEFAULT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.composant ALTER COLUMN id_composant SET DEFAULT nextval('public.composant_id_composant_seq'::regclass);


--
-- Name: contact id_contact; Type: DEFAULT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.contact ALTER COLUMN id_contact SET DEFAULT nextval('public.contact_id_contact_seq'::regclass);


--
-- Name: event_party id_event_party; Type: DEFAULT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.event_party ALTER COLUMN id_event_party SET DEFAULT nextval('public.event_party_id_event_party_seq'::regclass);


--
-- Name: game id_game; Type: DEFAULT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.game ALTER COLUMN id_game SET DEFAULT nextval('public.game_id_game_seq'::regclass);


--
-- Name: game_person id_game_person; Type: DEFAULT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.game_person ALTER COLUMN id_game_person SET DEFAULT nextval('public.game_person_id_game_person_seq'::regclass);


--
-- Name: lnk_participation_person_event_party id_lnk_participation_person_event_party; Type: DEFAULT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.lnk_participation_person_event_party ALTER COLUMN id_lnk_participation_person_event_party SET DEFAULT nextval('public.lnk_participation_person_even_id_lnk_participation_person_e_seq'::regclass);


--
-- Name: lnk_person_parameter id_lnk_person_parameter; Type: DEFAULT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.lnk_person_parameter ALTER COLUMN id_lnk_person_parameter SET DEFAULT nextval('public.lnk_person_parameter_id_lnk_person_parameter_seq'::regclass);


--
-- Name: notification id_notification; Type: DEFAULT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.notification ALTER COLUMN id_notification SET DEFAULT nextval('public.notification_id_notification_seq'::regclass);


--
-- Name: object id_object; Type: DEFAULT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.object ALTER COLUMN id_object SET DEFAULT nextval('public.object_id_object_seq'::regclass);


--
-- Name: object_profile id_object_profile; Type: DEFAULT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.object_profile ALTER COLUMN id_object_profile SET DEFAULT nextval('public.object_profile_id_object_profile_seq'::regclass);


--
-- Name: parameter_type id_parameter_type; Type: DEFAULT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.parameter_type ALTER COLUMN id_parameter_type SET DEFAULT nextval('public.parameter_type_id_parameter_type_seq'::regclass);


--
-- Name: person id_person; Type: DEFAULT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.person ALTER COLUMN id_person SET DEFAULT nextval('public.person_id_person_seq'::regclass);


--
-- Name: plant id_plant; Type: DEFAULT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.plant ALTER COLUMN id_plant SET DEFAULT nextval('public.plant_id_plant_seq'::regclass);


--
-- Name: plant_person id_plant_person; Type: DEFAULT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.plant_person ALTER COLUMN id_plant_person SET DEFAULT nextval('public.plant_person_id_plant_person_seq'::regclass);


--
-- Name: plant_type id_plant_type; Type: DEFAULT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.plant_type ALTER COLUMN id_plant_type SET DEFAULT nextval('public.plant_type_id_plant_type_seq'::regclass);


--
-- Name: relationship id_relationship; Type: DEFAULT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.relationship ALTER COLUMN id_relationship SET DEFAULT nextval('public.relationship_id_relationship_seq'::regclass);


--
-- Name: role id_role; Type: DEFAULT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.role ALTER COLUMN id_role SET DEFAULT nextval('public.role_id_role_seq'::regclass);


--
-- Data for Name: avatar; Type: TABLE DATA; Schema: public; Owner: zrzr
--

COPY public.avatar (id_avatar, title, description, picture_path, evolution_number, id_plant_type) FROM stdin;
\.


--
-- Data for Name: category_type; Type: TABLE DATA; Schema: public; Owner: zrzr
--

COPY public.category_type (id_category_type, title, description, advise) FROM stdin;
\.


--
-- Data for Name: composant; Type: TABLE DATA; Schema: public; Owner: zrzr
--

COPY public.composant (id_composant, title, description, is_working, int_ret, string_ret, long_ret, id_object) FROM stdin;
\.


--
-- Data for Name: contact; Type: TABLE DATA; Schema: public; Owner: zrzr
--

COPY public.contact (id_contact, relation, description, is_active, value_return, id_person, id_relationship) FROM stdin;
\.


--
-- Data for Name: event_party; Type: TABLE DATA; Schema: public; Owner: zrzr
--

COPY public.event_party (id_event_party, title, description, "isLaunch", "beginDate", "endDate", rules, "createdAt", "updatedAt") FROM stdin;
1	Summer Gaming Tournament	Join us for an exciting summer gaming tournament with amazing prizes!	f	2024-07-01	2024-07-31	1. All participants must register before the event\n2. No cheating allowed\n3. Prizes will be awarded to top 3 players	2025-05-07 19:30:59.651469	2025-05-07 19:30:59.651469
\.


--
-- Data for Name: game; Type: TABLE DATA; Schema: public; Owner: zrzr
--

COPY public.game (id_game, title, description, "idWon", "idLose", "beginDate", "endDate", rules, "createdAt", "updatedAt", id_event_party) FROM stdin;
\.


--
-- Data for Name: game_person; Type: TABLE DATA; Schema: public; Owner: zrzr
--

COPY public.game_person (id_game_person, "isOwner", "isPlayer", "createdAt", "updatedAt", id_game, id_person) FROM stdin;
\.


--
-- Data for Name: lnk_participation_person_event_party; Type: TABLE DATA; Schema: public; Owner: zrzr
--

COPY public.lnk_participation_person_event_party (id_lnk_participation_person_event_party, id_person, id_event_party, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: lnk_person_parameter; Type: TABLE DATA; Schema: public; Owner: zrzr
--

COPY public.lnk_person_parameter (id_lnk_person_parameter, is_value, id_person, id_parameter_type) FROM stdin;
\.


--
-- Data for Name: notification; Type: TABLE DATA; Schema: public; Owner: zrzr
--

COPY public.notification (id_notification, title, description, value_custom_01, value_custom_02, id_object, id_person) FROM stdin;
\.


--
-- Data for Name: object; Type: TABLE DATA; Schema: public; Owner: zrzr
--

COPY public.object (id_object, title, description, is_working, is_automatic, value_return, height, weight, advise, preference_number, id_person, id_category_type) FROM stdin;
\.


--
-- Data for Name: object_profile; Type: TABLE DATA; Schema: public; Owner: zrzr
--

COPY public.object_profile (id_object_profile, title, description, price, height, weight, advise, category, strenght, speed, life, id_object, id_plant_type) FROM stdin;
\.


--
-- Data for Name: parameter_type; Type: TABLE DATA; Schema: public; Owner: zrzr
--

COPY public.parameter_type (id_parameter_type, title, short_description, description, is_display) FROM stdin;
\.


--
-- Data for Name: person; Type: TABLE DATA; Schema: public; Owner: zrzr
--

COPY public.person (id_person, mail, firstname, surname, password, number_phone, id_role, "createdAt", "updatedAt") FROM stdin;
1	john.doe@example.com	John	Doe	$2b$10$/7tIQs2x1LJb5iXkBPSEK.QDJEdVnVCD824WkWs/V3L.iVdXMpAxK	+33612345678	1	2025-05-07 21:10:15.898901	2025-05-07 21:10:15.898901
2	john.doe3@example.com	John	Doe	$2b$10$WPSt86cNyoAiemw.E29UYu0h2scJtNgxvmdhozcKJ70ebQpQf8ZZS	+33612345678	2	2025-05-07 21:15:58.998683	2025-05-07 21:15:58.998683
3	john.doe4@example.com	John	Doe	$2b$10$sR8ASISF9Br9N0u/N4wp6ufOIPGJo.jKENruVU7sdZhI2h3/7wZL6	+33612345678	2	2025-05-07 21:18:02.989171	2025-05-07 21:18:02.989171
\.


--
-- Data for Name: plant; Type: TABLE DATA; Schema: public; Owner: zrzr
--

COPY public.plant (id_plant, name, description, price, category, "isAvailable", id_person, "createdAt", "updatedAt") FROM stdin;
\.


--
-- Data for Name: plant_person; Type: TABLE DATA; Schema: public; Owner: zrzr
--

COPY public.plant_person (id_plant_person, "isOwner", "isSeller", "createdAt", "updatedAt", id_plant, id_person) FROM stdin;
\.


--
-- Data for Name: plant_type; Type: TABLE DATA; Schema: public; Owner: zrzr
--

COPY public.plant_type (id_plant_type, title, description, height, weight, advise, category) FROM stdin;
\.


--
-- Data for Name: relationship; Type: TABLE DATA; Schema: public; Owner: zrzr
--

COPY public.relationship (id_relationship, title, description) FROM stdin;
\.


--
-- Data for Name: role; Type: TABLE DATA; Schema: public; Owner: zrzr
--

COPY public.role (id_role, title, description) FROM stdin;
1	Admin	Administrator with full system access and management capabilities
2	User	Regular user with standard access rights
\.


--
-- Name: avatar_id_avatar_seq; Type: SEQUENCE SET; Schema: public; Owner: zrzr
--

SELECT pg_catalog.setval('public.avatar_id_avatar_seq', 1, false);


--
-- Name: category_type_id_category_type_seq; Type: SEQUENCE SET; Schema: public; Owner: zrzr
--

SELECT pg_catalog.setval('public.category_type_id_category_type_seq', 1, false);


--
-- Name: composant_id_composant_seq; Type: SEQUENCE SET; Schema: public; Owner: zrzr
--

SELECT pg_catalog.setval('public.composant_id_composant_seq', 1, false);


--
-- Name: contact_id_contact_seq; Type: SEQUENCE SET; Schema: public; Owner: zrzr
--

SELECT pg_catalog.setval('public.contact_id_contact_seq', 1, false);


--
-- Name: event_party_id_event_party_seq; Type: SEQUENCE SET; Schema: public; Owner: zrzr
--

SELECT pg_catalog.setval('public.event_party_id_event_party_seq', 1, true);


--
-- Name: game_id_game_seq; Type: SEQUENCE SET; Schema: public; Owner: zrzr
--

SELECT pg_catalog.setval('public.game_id_game_seq', 1, false);


--
-- Name: game_person_id_game_person_seq; Type: SEQUENCE SET; Schema: public; Owner: zrzr
--

SELECT pg_catalog.setval('public.game_person_id_game_person_seq', 1, false);


--
-- Name: lnk_participation_person_even_id_lnk_participation_person_e_seq; Type: SEQUENCE SET; Schema: public; Owner: zrzr
--

SELECT pg_catalog.setval('public.lnk_participation_person_even_id_lnk_participation_person_e_seq', 1, false);


--
-- Name: lnk_person_parameter_id_lnk_person_parameter_seq; Type: SEQUENCE SET; Schema: public; Owner: zrzr
--

SELECT pg_catalog.setval('public.lnk_person_parameter_id_lnk_person_parameter_seq', 1, false);


--
-- Name: notification_id_notification_seq; Type: SEQUENCE SET; Schema: public; Owner: zrzr
--

SELECT pg_catalog.setval('public.notification_id_notification_seq', 1, false);


--
-- Name: object_id_object_seq; Type: SEQUENCE SET; Schema: public; Owner: zrzr
--

SELECT pg_catalog.setval('public.object_id_object_seq', 1, false);


--
-- Name: object_profile_id_object_profile_seq; Type: SEQUENCE SET; Schema: public; Owner: zrzr
--

SELECT pg_catalog.setval('public.object_profile_id_object_profile_seq', 1, false);


--
-- Name: parameter_type_id_parameter_type_seq; Type: SEQUENCE SET; Schema: public; Owner: zrzr
--

SELECT pg_catalog.setval('public.parameter_type_id_parameter_type_seq', 1, false);


--
-- Name: person_id_person_seq; Type: SEQUENCE SET; Schema: public; Owner: zrzr
--

SELECT pg_catalog.setval('public.person_id_person_seq', 3, true);


--
-- Name: plant_id_plant_seq; Type: SEQUENCE SET; Schema: public; Owner: zrzr
--

SELECT pg_catalog.setval('public.plant_id_plant_seq', 1, false);


--
-- Name: plant_person_id_plant_person_seq; Type: SEQUENCE SET; Schema: public; Owner: zrzr
--

SELECT pg_catalog.setval('public.plant_person_id_plant_person_seq', 1, false);


--
-- Name: plant_type_id_plant_type_seq; Type: SEQUENCE SET; Schema: public; Owner: zrzr
--

SELECT pg_catalog.setval('public.plant_type_id_plant_type_seq', 1, false);


--
-- Name: relationship_id_relationship_seq; Type: SEQUENCE SET; Schema: public; Owner: zrzr
--

SELECT pg_catalog.setval('public.relationship_id_relationship_seq', 1, false);


--
-- Name: role_id_role_seq; Type: SEQUENCE SET; Schema: public; Owner: zrzr
--

SELECT pg_catalog.setval('public.role_id_role_seq', 2, true);


--
-- Name: plant PK_1cc0446eae3b263775ad31b38cb; Type: CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.plant
    ADD CONSTRAINT "PK_1cc0446eae3b263775ad31b38cb" PRIMARY KEY (id_plant);


--
-- Name: plant_person PK_381c865ac8fc7251b305c185653; Type: CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.plant_person
    ADD CONSTRAINT "PK_381c865ac8fc7251b305c185653" PRIMARY KEY (id_plant_person);


--
-- Name: event_party PK_4a526410be9352d8c1cb27cf952; Type: CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.event_party
    ADD CONSTRAINT "PK_4a526410be9352d8c1cb27cf952" PRIMARY KEY (id_event_party);


--
-- Name: game PK_5333d88fc4e0c153f520d73c91c; Type: CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.game
    ADD CONSTRAINT "PK_5333d88fc4e0c153f520d73c91c" PRIMARY KEY (id_game);


--
-- Name: person PK_a39bc9452ab1068b945834c3695; Type: CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT "PK_a39bc9452ab1068b945834c3695" PRIMARY KEY (id_person);


--
-- Name: game_person PK_b312039d098152cf66205ecfd05; Type: CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.game_person
    ADD CONSTRAINT "PK_b312039d098152cf66205ecfd05" PRIMARY KEY (id_game_person);


--
-- Name: avatar pk_avatar; Type: CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.avatar
    ADD CONSTRAINT pk_avatar PRIMARY KEY (id_avatar);


--
-- Name: category_type pk_category_type; Type: CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.category_type
    ADD CONSTRAINT pk_category_type PRIMARY KEY (id_category_type);


--
-- Name: composant pk_composant; Type: CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.composant
    ADD CONSTRAINT pk_composant PRIMARY KEY (id_composant);


--
-- Name: contact pk_contact; Type: CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.contact
    ADD CONSTRAINT pk_contact PRIMARY KEY (id_contact);


--
-- Name: lnk_participation_person_event_party pk_lnk_participation_person_event_party; Type: CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.lnk_participation_person_event_party
    ADD CONSTRAINT pk_lnk_participation_person_event_party PRIMARY KEY (id_lnk_participation_person_event_party);


--
-- Name: lnk_person_parameter pk_lnk_person_parameter; Type: CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.lnk_person_parameter
    ADD CONSTRAINT pk_lnk_person_parameter PRIMARY KEY (id_lnk_person_parameter);


--
-- Name: notification pk_notification; Type: CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT pk_notification PRIMARY KEY (id_notification);


--
-- Name: object pk_object; Type: CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.object
    ADD CONSTRAINT pk_object PRIMARY KEY (id_object);


--
-- Name: object_profile pk_object_profile; Type: CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.object_profile
    ADD CONSTRAINT pk_object_profile PRIMARY KEY (id_object_profile);


--
-- Name: parameter_type pk_parameter_type; Type: CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.parameter_type
    ADD CONSTRAINT pk_parameter_type PRIMARY KEY (id_parameter_type);


--
-- Name: plant_type pk_plant_type; Type: CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.plant_type
    ADD CONSTRAINT pk_plant_type PRIMARY KEY (id_plant_type);


--
-- Name: relationship pk_relationship; Type: CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.relationship
    ADD CONSTRAINT pk_relationship PRIMARY KEY (id_relationship);


--
-- Name: role pk_role; Type: CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.role
    ADD CONSTRAINT pk_role PRIMARY KEY (id_role);


--
-- Name: plant FK_144bcc6e8001561492c327b590a; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.plant
    ADD CONSTRAINT "FK_144bcc6e8001561492c327b590a" FOREIGN KEY (id_person) REFERENCES public.person(id_person);


--
-- Name: person FK_1aaef473a75f730698f56a2b181; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.person
    ADD CONSTRAINT "FK_1aaef473a75f730698f56a2b181" FOREIGN KEY (id_role) REFERENCES public.role(id_role);


--
-- Name: plant_person FK_1d68f1cac787db2a31035cceb91; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.plant_person
    ADD CONSTRAINT "FK_1d68f1cac787db2a31035cceb91" FOREIGN KEY (id_person) REFERENCES public.person(id_person);


--
-- Name: game_person FK_28d35ce392153e1c12478eb322c; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.game_person
    ADD CONSTRAINT "FK_28d35ce392153e1c12478eb322c" FOREIGN KEY (id_game) REFERENCES public.game(id_game);


--
-- Name: lnk_participation_person_event_party FK_4911468084d02933719de31e512; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.lnk_participation_person_event_party
    ADD CONSTRAINT "FK_4911468084d02933719de31e512" FOREIGN KEY (id_event_party) REFERENCES public.event_party(id_event_party);


--
-- Name: lnk_participation_person_event_party FK_4f0a1e10b174a6feead861e83b6; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.lnk_participation_person_event_party
    ADD CONSTRAINT "FK_4f0a1e10b174a6feead861e83b6" FOREIGN KEY (id_person) REFERENCES public.person(id_person);


--
-- Name: plant_person FK_8b5a67b59110d437a58a7a90847; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.plant_person
    ADD CONSTRAINT "FK_8b5a67b59110d437a58a7a90847" FOREIGN KEY (id_plant) REFERENCES public.plant(id_plant);


--
-- Name: game_person FK_d3764174b67b00c34f89f0f215d; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.game_person
    ADD CONSTRAINT "FK_d3764174b67b00c34f89f0f215d" FOREIGN KEY (id_person) REFERENCES public.person(id_person);


--
-- Name: game FK_d55a20116344d227e7cb399ebeb; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.game
    ADD CONSTRAINT "FK_d55a20116344d227e7cb399ebeb" FOREIGN KEY (id_event_party) REFERENCES public.event_party(id_event_party);


--
-- Name: object fk_category_type; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.object
    ADD CONSTRAINT fk_category_type FOREIGN KEY (id_category_type) REFERENCES public.category_type(id_category_type);


--
-- Name: composant fk_object; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.composant
    ADD CONSTRAINT fk_object FOREIGN KEY (id_object) REFERENCES public.object(id_object);


--
-- Name: object_profile fk_object; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.object_profile
    ADD CONSTRAINT fk_object FOREIGN KEY (id_object) REFERENCES public.object(id_object);


--
-- Name: lnk_person_parameter fk_parameter_type; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.lnk_person_parameter
    ADD CONSTRAINT fk_parameter_type FOREIGN KEY (id_parameter_type) REFERENCES public.parameter_type(id_parameter_type);


--
-- Name: contact fk_person; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.contact
    ADD CONSTRAINT fk_person FOREIGN KEY (id_person) REFERENCES public.person(id_person);


--
-- Name: object fk_person; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.object
    ADD CONSTRAINT fk_person FOREIGN KEY (id_person) REFERENCES public.person(id_person);


--
-- Name: notification fk_person; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.notification
    ADD CONSTRAINT fk_person FOREIGN KEY (id_person) REFERENCES public.person(id_person);


--
-- Name: lnk_person_parameter fk_person; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.lnk_person_parameter
    ADD CONSTRAINT fk_person FOREIGN KEY (id_person) REFERENCES public.person(id_person);


--
-- Name: avatar fk_plant_type; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.avatar
    ADD CONSTRAINT fk_plant_type FOREIGN KEY (id_plant_type) REFERENCES public.plant_type(id_plant_type);


--
-- Name: object_profile fk_plant_type; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.object_profile
    ADD CONSTRAINT fk_plant_type FOREIGN KEY (id_plant_type) REFERENCES public.plant_type(id_plant_type);


--
-- Name: contact fk_relationship; Type: FK CONSTRAINT; Schema: public; Owner: zrzr
--

ALTER TABLE ONLY public.contact
    ADD CONSTRAINT fk_relationship FOREIGN KEY (id_relationship) REFERENCES public.relationship(id_relationship);


--
-- PostgreSQL database dump complete
--

