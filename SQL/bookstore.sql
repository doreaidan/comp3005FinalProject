--users
create table user_registered
	(username		varchar(20), 
	 pass			varchar(20), 
	 primary key (username)
	);

--admins
create table admin_registered
	(username		varchar(20), 
	 pass			varchar(20), 
	 primary key (username)
	);

--all book copies are represented in the quantity attribute
create table book
	(ISBN       varchar(13),
     book_name  varchar(20),  
	 genre		varchar(20),		
     page_num   numeric(5,0),
     price      numeric(5,2),
	 quantity   numeric(7,0),
	 primary key (ISBN)
	);

--tracks admin orders to be used in stats
create table admin_order
	(username		varchar(20), 
	 ISBN       varchar(13), 
	 primary key (username, ISBN),    
	 foreign key (username) references admin_registered 
	 	on delete cascade,    
	 foreign key (ISBN) references book 
	 	on delete cascade
	);

--author for books as they can have multiple authors
create table author  
	(ISBN       varchar(13), 
	 author    varchar(50),
	 primary key (ISBN, author),    
	 foreign key (ISBN) references book 
	 	on delete cascade
	);

--publisher for books as they can have multiple publishers
create table publisher  
	(ISBN       varchar(13), 
	 pub_name    varchar(20),
	 pub_address    varchar(20),
	 pub_email    varchar(20),
	 pub_phone_num    varchar(20),
	 pub_bank    varchar(20),
     pub_royalty    numeric(5,2),
	 primary key (ISBN, pub_name),    
	 foreign key (ISBN) references book 
	 	on delete cascade
	);

--publisher phone numbers
create table pub_phone_num
	(
		ISBN       varchar(13),
		pub_name    varchar(20),
		phone_num       varchar(20), 
	 	primary key (phone_num, pub_name),    
	 	foreign key (ISBN, pub_name) references publisher 
	 		on delete cascade
	);

--user shipping and billing info, added at registration but has the functionality to be changed later
create table shippingBilling
	(username		varchar(20), 
	 first_name		varchar(20),
	 last_name		varchar(20),
	 user_address		varchar(40),
	 city		varchar(20),
	 country		varchar(20),
	 province_state		varchar(20),
	 postal_code		varchar(20),
	 primary key (username),
	 foreign key (username) references user_registered 
	 	on delete cascade
	);

--each entity represent a different book in the cart, each has quantity
create table checkOutBasket
	(username		varchar(20), 
	 ISBN       varchar(13),
	 quantity   numeric(7,0),
	 primary key (username, ISBN),
	 foreign key (username) references user_registered
        on delete cascade,
     foreign key (ISBN) references book
	 	on delete cascade
	);

--tracks user orders for stats
create table userOrder
	(orderNum 	SERIAL,
	 username	varchar(20), 
	 quantity   numeric(7,0),
	 primary key (username, orderNum),
	 foreign key (username) references user_registered 
	 	on delete cascade
	);
