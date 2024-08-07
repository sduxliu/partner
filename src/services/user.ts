import myAxios from "../plugins/myAxios";
import {getCurrentUserState, setCurrentUserState} from "../states/user";
import {currentID} from "../states/currentID";
// import {getcurrentID} from "../states/currentID";
//调用函数获取当前用户信息
export const getCurrentUser = async () => {
    // 不存在则从远程获取
    // console.log(currentID.value)
    // alert(currentID.value)
    if(getCurrentUserState() !== undefined || currentID.value !== undefined){
        return getCurrentUserState();
    }
    const res = await myAxios.get('/user/current');
    // @ts-ignore
    if (res.code === 0) {
        setCurrentUserState(res.data);
        currentID.value = res.data.id;
        return res.data;
    }
    return null;

}

