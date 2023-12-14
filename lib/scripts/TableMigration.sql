CREATE TABLE PROJECT_healthTrackerWeight LIKE PROJECTAlgoDB.PROJECT_userContent_healthTrackerWeight;

INSERT INTO PROJECTAlgoDB.PROJECT_healthTrackerWeight SELECT * FROM PROJECTAlgoDB.PROJECT_userContent_healthTrackerWeight;

-- delete columns via datagrip

ALTER TABLE PROJECTAlgoDB.PROJECT_healthTrackerWeight MODIFY COLUMN units varchar(6) after value;

---

INSERT INTO PROJECTAlgoDB.PROJECT_healthTracker
SELECT *
FROM PROJECTAlgoDB.PROJECT_userContent_healthTrackerWeight;
-- delete contentId and referenceItem
-- delete columns via datagrip

-- deleting columns
alter table PROJECT_healthTracker
    drop column contentId;

 -- making a units column
    alter table PROJECT_healthTracker
        add units varchar(3) default 'kg' not null;

-- rearranging a column location in the table
ALTER TABLE PROJECTAlgoDB.PROJECT_healthTrackerWeight MODIFY COLUMN units varchar(6) after value;

--to update specific values in tables
UPDATE PROJECTAlgoDB.PROJECT_healthTrackerFood SET units = 'ml' WHERE type = 'bottleFeed';

UPDATE PROJECTAlgoDB.PROJECT_healthTrackerFood SET subType = 'SOLID' WHERE type = 'solidFeed';

-- distinct
SELECT DISTINCT subType from PROJECTAlgoDB.PROJECT_healthTrackerFood;