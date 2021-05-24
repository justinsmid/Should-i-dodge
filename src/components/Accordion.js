import React from 'react';
import {Accordion as MUIAccordion, AccordionDetails, AccordionSummary} from '@material-ui/core';
import ExpandMoreIcon from '@material-ui/icons/ExpandMore';

const Accordion = ({title, children, ...props}) => {
    return (
        <MUIAccordion {...props}>
            <AccordionSummary expandIcon={<ExpandMoreIcon />}>
                {typeof title === 'string'
                    ? <p>{title}</p>
                    : title
                }
            </AccordionSummary >
            <AccordionDetails>
                <div className="column full-width">
                    {children}
                </div>
            </AccordionDetails>
        </MUIAccordion >
    );
};

export default Accordion;