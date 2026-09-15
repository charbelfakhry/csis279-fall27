const Footer = () =>{

    const dateNow = () =>
    {
        let now = new Date();
        return now.getFullYear()+"-"+now.getMonth()+"-"+now.getDate();
    }

    return(
        <>
            <h3>Footer component <span style={{color: "red"}}>{dateNow()}</span></h3>
        </>
    )
}

export default Footer;